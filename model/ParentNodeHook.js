import isArray from '../util/isArray'

/*
  This is an experiment trying to have better support for data types with a hierarchical
  nature, such as Lists, Tables etc.

  Our data model is inherently flat, and does not have any special support for hierarchical data types.
  The flat data model is essential for a simple OT implementation. Hierarchy is achieved by storing ids
  to reference child nodes.

  After longer discussions we agreed that we are very happy with the overlay nature
  of annotations, i.e., text is essentially modelled as plain text, and annotations are attached to it.
  This way we can map complex text manipulation to primitive object operations.
  For many other content types it would often be extremly helpful being able to traverse the structure in both
  directions, from parent to children (which is already possible), and back from children to parent.

  We do not want to store a the id of a parent node into the children, as this would be redundant, and would increase the amount of necessary operations.
  Instead we want to establish a link dynamically on the Node instance when the id is set in the parent (during construction or when updated).

  The most unobtrusive implementation is to add an 'operation:applied' hook, watching for such changes
  and setting the reference.
*/
export default class ParentNodeHook {
  constructor (doc) {
    this.doc = doc

    // remembering parents for children, when nodes are loaded in wrong order
    // key: node.id, value: { parent, property }
    this.parents = {}

    doc.data.on('operation:applied', this._onOperationApplied, this)
  }

  _onOperationApplied (op) {
    const doc = this.doc
    const node = doc.get(op.path[0])
    let hasChildProperties = false
    let isAnnotation = false
    let nodeSchema
    if (node) {
      nodeSchema = node.getSchema()
      hasChildProperties = nodeSchema.hasChildProperties()
      isAnnotation = node.isAnnotation()
    }
    switch (op.type) {
      case 'create': {
        if (hasChildProperties) {
          const childProps = nodeSchema.getChildProperties()
          for (const prop of childProps) {
            const isChildren = prop.isArray()
            const refs = node.get(prop.name)
            if (refs) {
              this._setParent(node, refs, prop.name, isChildren)
            }
            if (isChildren) this._updateContainerPositions([node.id, prop.name])
          }
        }
        if (isAnnotation) {
          this._setAnnotationParent(node)
        }
        this._setRegisteredParent(node)
        break
      }
      case 'update': {
        if (hasChildProperties) {
          const propName = op.path[1]
          if (nodeSchema.isOwned(propName)) {
            const update = op.diff
            const isChildren = update._isArrayOperation
            if (update.isDelete()) {
              this._setParent(null, update.getValue(), propName, isChildren)
            } else {
              this._setParent(node, update.getValue(), propName, isChildren)
            }
            if (isChildren) this._updateContainerPositions(op.path)
          }
        }
        break
      }
      case 'set': {
        if (hasChildProperties) {
          const propName = op.path[1]
          if (nodeSchema.isOwned(propName)) {
            const prop = nodeSchema.getProperty(propName)
            const isChildren = prop.isArray()
            const oldValue = op.getOldValue()
            const newValue = op.getValue()
            // Note: _setParent takes either an array or a single id
            this._setParent(null, oldValue, propName, isChildren)
            this._setParent(node, newValue, propName, isChildren)
            if (isChildren) this._updateContainerPositions(op.path)
          }
        }
        if (isAnnotation && op.path[1] === 'start' && op.path[2] === 'path') {
          this._setAnnotationParent(node)
        }
        break
      }
      default:
        //
    }
  }

  _setParent (parent, ids, property, isChildren) {
    if (ids) {
      if (isArray(ids)) {
        ids.forEach(id => this.__setParent(parent, id, property, isChildren))
      } else {
        this.__setParent(parent, ids, property, isChildren)
      }
    }
  }

  __setParent (parent, id, property, isChildren) {
    const child = this.doc.get(id)
    if (child) {
      this._setParentAndXpath(parent, child, property)
    } else {
      // Note: it can happen, e.g. during deserialization, that the child node
      // is created later than the parent so we store the parent for later
      // While on Document.createFromDocument() we consider the order via dependeny analysis
      // this can still happen when a document is loaded from some other sources,
      // which does not take any measures to create nodes in a correct order.
      // So, we must be prepared.
      this.parents[id] = { parent, property, isChildren }
    }
  }

  _setRegisteredParent (child) {
    const entry = this.parents[child.id]
    if (entry) {
      const { parent, property, isChildren } = entry
      this._setParentAndXpath(parent, child, property)
      if (parent && isChildren) {
        child._xpath.pos = parent[property].indexOf(child.id)
      }
      delete this.parents[child.id]
    }
  }

  _setParentAndXpath (parent, child, property) {
    child.setParent(parent)
    const xpath = child._xpath
    if (parent) {
      xpath.prev = parent._xpath
      xpath.property = property
    } else {
      xpath.prev = null
      xpath.property = null
      // ATTENTION: need to remove this here, because
      // it will otherwise not be updated
      xpath.pos = null
    }
  }

  _updateContainerPositions (containerPath) {
    const doc = this.doc
    const ids = doc.get(containerPath)
    if (ids) {
      for (let pos = 0; pos < ids.length; pos++) {
        const id = ids[pos]
        const child = doc.get(id)
        if (child) {
          child._xpath.pos = pos
        }
      }
    }
  }

  _setAnnotationParent (anno) {
    const doc = anno.getDocument()
    const path = anno.start.path
    const annoParent = doc.get(path[0])
    this._setParent(annoParent, anno.id, path[1])
  }

  static register (doc) {
    return new ParentNodeHook(doc)
  }
}
