import { forEach } from 'substance'
import { Engine } from 'substance-mini'
import { unpack } from '../value'

export default
class CellEngine extends Engine {

  constructor(editorSession) {
    super({waitForIdle: 500})

    this.editorSession = editorSession
    this.doc = editorSession.getDocument()

    this._cells = {}
    this._contexts = editorSession.getContext().stencilaContexts || {}

    console.log('INITIALIZING CELL ENGINE')
    this._initialize()

    editorSession.on('render', this._onDocumentChange, this, {
      resource: 'document'
    })
  }

  dispose() {
    super.dispos()
    this.editorSession.off(this)
  }

  /*
    Calling into the context.

    There are different types of calls:
    - function calls: the arguments are positional, and passed
      to the external function
    - external cells: arguments are provided as an object with
      names taken from the signature. The context is used to
      execute the sourceCode, using the arguments object.
    - chunk: like with external cells, arguments are provided
      as object. The source code is run in the same way as we know
      it from notebook cells, such as in Jupyter.
  */
  callFunction(funcNode) {
    const functionName = funcNode.name
    const expr = funcNode.expr
    const cell = expr._cell
    switch(functionName) {
      // external cells
      case 'call': {
        if (!cell) throw new Error('Internal error: no cell associated with expression.')
        if(!cell.language) throw new Error('language is mandatory for "call"')
        const lang = cell.language
        const context = this._contexts[lang]
        if (!context) throw new Error('No context for language ' + lang)
        const sourceCode = cell.sourceCode || ''
        const options = { pack: lang === 'js' ? false : true }
        const args = {}
        funcNode.args.forEach((arg) => {
          const name = arg.name
          if (!name) {
            console.warn('Only variables can be used with chunks and external cells')
            return
          }
          args[name] = arg.getValue()
        })
        return _unwrapResult(
          context.call(sourceCode, args, options),
          options
        )
      }
      // chunks
      case 'run': {

      }
      // all others are external functions
      default:
        // regular function calls: we need to lookup
        const func = this._lookupFunction(functionName)
        if (func) {
          // TODO: if we had the functions signature
          // we could support keyword arguments here
          const args = funcNode.args.map(arg => arg.getValue())
          const { context, contextName } = func
          const options = { pack: contextName === 'js' ? false : true }
          return _unwrapResult(
            context.callFunction(functionName, args, options),
            options
          )
        } else {
          return Promise.reject(`Could not resolve function "${functionName}"`)
        }
    }
  }

  _lookupFunction(functionName) {
    const contexts = this._contexts
    let names = Object.keys(contexts)
    for (let i = 0; i < names.length; i++) {
      const contextName = names[i]
      const context = contexts[contextName]
      if (context.hasFunction(functionName)) {
        return { contextName, context }
      }
    }
  }

  _onDocumentChange(change) {
    const doc = this.doc
    let needsUpdate = false
    // HACK: exploiting knowledge about ops used for manipulating cells
    // - create/delete of cells
    forEach(change.deleted, (node) => {
      if (node.type === 'cell' || node.type === 'inlince-cell') {
        this._deregisterCell(node.id)
        needsUpdate = true
      }
    })
    forEach(change.created, (node) => {
      if (node.type === 'cell' || node.type === 'inlince-cell') {
        this._registerCell(doc.get(node.id))
        needsUpdate = true
      }
    })
    if (needsUpdate) {
      super.update()
    }
  }

  _initialize() {
    let cells = this.doc.getIndex('type').get('cell')
    forEach(cells, (cell) => {
      this._registerCell(cell)
    })
    // this updates the dependency graph and triggers evaluation
    super.update()
  }

  _registerCell(cell) {
    cell._startWatching()
    cell._parse()
    this._cells[cell.id] = cell
    if (cell.errors && cell.errors.length) {
      console.error(cell.error)
    } else {
      if (cell._expr) {
        this._addExpression(cell._expr)
      }
      cell.on('expression:updated', this._updateCell, this)
      this.emit('engine:updated')
    }
    return cell
  }

  _deregisterCell(cellId) {
    const cell = this._cells[cellId]
    if (cell) {
      cell.off(this)
      cell._stopWatching()
      delete this._cells[cell.id]
      this._removeExpression(cell.id)
    }
  }

  _updateCell(cell) {
    // console.log('### Updating cell', cell.id)
    this._removeExpression(cell.id)
    if (cell._expr) {
      this._addExpression(cell._expr)
    }
    super.update()
  }

}

function _unwrapResult(p, options) {
  const pack = options.pack !== false
  return new Promise((resolve, reject) => {
    p.then((res) => {
      if (res.errors) {
        reject(res.errors)
      } else {
        const output = pack ? unpack(res.output) : res.output
        resolve(output)
      }
    })
  })
}

