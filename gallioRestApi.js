

module.export = function(gallio, options) {
  
  return function(req, res, next) {
    var requestHandled = handleRequest(req, res)
    if(!requestHandled) {
      next()
    }
  }

  
  var baseUrl = options.baseUrl || '/'
  if(!/\/$/.test(baseUrl)) {
    baseUrl += '/'
  }
  var baseUrlRegExp = new RegExp('^' + baseUrl)
  function handleRequest(req, res) {
    
    var url = req.url
    if(baseUrlRegExp.test(url)) {
      path = url.substr(baseUrl.length)
      var pathData = path.split('/')

      if(pathData.length > 2) {
        return res.status(404).send({message: 'no such URL'})
      }

      var entityDef = getEntityDef(pathData[0])
      var entityId = pathData[1]
      if(!entityDef) {
        return res.status(404).send({message: 'entity definition ['+pathData[0]+'] not found'})
      }
      switch(req.method) {
        case 'POST':
          if(entityId || req.body.id) {
            req.body.id = entityId;
            gallio.act({role:'entity', cmd: 'update', name: entityDef.name, ent: req.body}, function(err, result) {
              if(err) { res.status(500).send(err) }
              else { res.status(200).send(result) }
            })
          } else {
            gallio.act({role:'entity', cmd: 'create', name: entityDef.name, ent: req.body}, function(err, result) {
              if(err) { res.status(500).send(err) }
              else { res.status(200).send(result) }
            })
          }
          break
        case 'GET':
          if(entityId) {
            gallio.act({role:'entity', cmd: 'load', name: entityDef.name, ent: {id: entityId}}, function(err, result) {
              if(err) { res.status(500).send(err) }
              else { res.status(200).send(result) }
            })
          } else {
            res.status(400).send({message: 'missing entity id'})
          }
          break
        default:
          res.status(404).send({message: 'unsupported method ['+req.method+']'})
          break
      }
    }
    
  }
}

function getEntityDef(entityName, entitiesDef) {
  return _.find(entitiesDef, function(entityDef) {
    if(entityDef && entityDef.name == entityName) {
      return entityDef
    }
  })
}
