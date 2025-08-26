/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // update collection data
  unmarshal({
    "name": "uploaded_images"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // update collection data
  unmarshal({
    "name": "upload_images"
  }, collection)

  return app.save(collection)
})
