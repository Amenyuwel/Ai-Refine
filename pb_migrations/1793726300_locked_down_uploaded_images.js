/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // anonymous create stays (SHARE has no login); null rules are superuser-only
  unmarshal({
    "createRule": "",
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  const imagesField = collection.fields.getById("file3760176746")
  imagesField.maxSize = 10485760
  imagesField.mimeTypes = ["image/png", "image/jpeg", "image/webp"]

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  unmarshal({
    "createRule": "",
    "deleteRule": "",
    "listRule": "",
    "updateRule": "",
    "viewRule": ""
  }, collection)

  const imagesField = collection.fields.getById("file3760176746")
  imagesField.maxSize = 0
  imagesField.mimeTypes = []

  return app.save(collection)
})
