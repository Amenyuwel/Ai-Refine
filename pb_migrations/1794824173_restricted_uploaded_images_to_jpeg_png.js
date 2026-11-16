/// <reference path="../pb_data/types.d.ts" />
// Matches ACCEPTED_IMAGE_TYPES in app/utils/imageTypes.js so the server rejects what the UI rejects
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  const imagesField = collection.fields.getById("file3760176746")
  imagesField.mimeTypes = ["image/png", "image/jpeg"]

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  const imagesField = collection.fields.getById("file3760176746")
  imagesField.mimeTypes = ["image/png", "image/jpeg", "image/webp"]

  return app.save(collection)
})
