import { documentHelpers } from '../model'
import ApiExtension from './ApiExtension'

export default class AuthorApi extends ApiExtension {
  /**
   * @param {object} data from AuthorModal state
   */
  addAuthor (data) {
    this.insertAuthor(data)
  }

  insertAuthor (data, currentAuthor) {
    const editorSession = this.api.getEditorSession()
    const doc = editorSession.getDocument()
    const root = doc.root
    let insertPos = root.authors.length
    if (currentAuthor) {
      insertPos = currentAuthor.getPosition() + 1
    }
    const nodeData = Object.assign({}, data, { type: 'author' })
    // prune empty middlenames
    nodeData.middleNames = nodeData.middleNames.filter(Boolean)
    this.api.insertNode([root.id, 'authors'], insertPos, nodeData)
  }

  /**
   * @param {string} authorId
   * @param {object} data from AuthorModal state
   */
  updateAuthor (authorId, data) {
    // prune empty middlenames
    data.middleNames = data.middleNames.filter(Boolean)
    this.api.getEditorSession().transaction(tx => {
      documentHelpers.updateProperty(tx, [authorId, 'firstName'], data.firstName)
      documentHelpers.updateProperty(tx, [authorId, 'middleNames'], data.middleNames)
      documentHelpers.updateProperty(tx, [authorId, 'lastName'], data.lastName)
      documentHelpers.updateProperty(tx, [authorId, 'prefix'], data.prefix)
      documentHelpers.updateProperty(tx, [authorId, 'suffix'], data.suffix)
      documentHelpers.updateProperty(tx, [authorId, 'affiliations'], data.affiliations)
      this.api._selectItem(tx, tx.get(authorId))
    })
  }
}