/******************************************************************************************
 *  XP Score Keeper Project!
 * 
 *  A Google Chat bot script used to store player experience points in a Cloud Firestore
 *  database. We use a Google Apps Script Library called 'FirestoreGoogleAppsScript' to
 *  make our lives a little easier (link below).
 * 
 *  https://github.com/grahamearley/FirestoreGoogleAppsScript
 * 
 *
 *  Created by: E.Cope                                          (Last edit: 2/16/21)
 *
 ******************************************************************************************/

/** ========================================================================================== *
    == == == == == == == == == == == == CONSTANTS == == == == == == == == == == == == == == ==
 ** ========================================================================================== */

// Default Collection's Name:
const COLLECTION = 'SCOREBOARD'
// Default Document Contents Upon Creation:
const DEFAULTDOC = {"_totalXP": 0}
// List of Players (Document ids):
const NAMESLIST = ['Brandon', 'Dana', 'Evan', 'Kiersten', 'McCauley', 'Sara']
// Users with READ permissions:
const ALLOWREAD = ['Brandon', 'Dana', 'Evan', 'Kiersten', 'McCauley', 'Sara']
// Users with WRITE permissions:
const ALLOWWRITE = ['Evan']
// Users with DELETE permissions:
const ALLOWDELETE = ['Evan']
// ON/OFF Switch for Document Deletions:
const ALLOWDOCDELETION = false
// A Safe Place to Store Our Firebase Project Credentials (specific to Google Apps Script):
const PROPS = PropertiesService.getUserProperties()


/** ========================================================================================== *
    == == == == == == == == == == == == HELPER FUNCTIONS  == == == == == == == == == == == ==
 ** ========================================================================================== */

/**
 * Retreives just the first name of the user sending a chat's message.
 * @param {object} event The event object from Hangouts Chat.
 * @return {string} The first name from the user's chat display name.
 */
const _firstNameOnly = (event) => {
  // Grab the display name:
  const displayName = event.user.displayName
  // Split the name at the space and store as an array:
  const splitNames = displayName.split(" ", 2)
  // Return just the first name:
  return splitNames[0]
}


// Handles GET requests in Apps Script.
const doGet = (e) => e

// Handles POST requests in Apps Script.
const doPost = (e) => e


/** ========================================================================================== *
    == == == == == == == == == == FIRESTORE CLOUD DATABASE STUFF == == == == == == == == == ==
 ** ========================================================================================== */

// Assign Credential Properties:
const [clientEmail, secretsKey, projectID] = [PROPS.getProperty('client_email'),
                                              PROPS.getProperty('private_key'),
                                              PROPS.getProperty('project_id')]

// Create a Firestore object & authenticate:
const fs = FirestoreApp.getFirestore(clientEmail, secretsKey, projectID)  


/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ *
   * * * * * * * * * * * * * * * *   DOCUMENT CRUD OPERATIONS   * * * * * * * * * * * * * * * * 
 **~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Creates a new document in the given collection by specifying the name/id and data to add to the
 *     document.
 * @param {object} event The Google Chat event.
 * @param {string} doc_name The new documents name/id value.
 * @param {object=DEFAULTDOC} data The key-value data to initialize in the document.
 * @param {string=COLLECTION} collection The collection to add to.
 * @return {string} A message that the doc was created, or access was denied.
 */
const _CreateDocument_ = (event, doc_name, data=DEFAULTDOC, collection=COLLECTION) => {

  const firstName = _firstNameOnly(event)
  let message = `Sorry ${firstName}, you do not have write permissions.`

  // [CASE] check ALLOWWRITE Permissions:
  if (ALLOWWRITE.includes(firstName)) {
    // The create document request:
    const req = fs.createDocument(`${collection}/${doc_name}`, data)
    // POST the request & store data returned:
    const res = doPost(req)
    // Take object returned by POST request & select just the data as JSON.
    const json = JSON.stringify(res.obj)
    // Confirmation message.
    message = `There's a new peep in ${collection}!\n${doc_name}: ${json}`
  }

  return message
}


/**
 * Returns a document from a given collection based on the document's name/id.
 * @param {object} event The Google Chat event.
 * @param {string} doc_name The document name/id value to look for.
 * @param {boolean=false} data_only Whether to read in just the data of the doc, or the whole thing.
 * @param {string=COLLECTION} collection The name of the collection where the document can be found.
 * @return {object} The document object (or just its data) as JSON. Returns an empty object if the
 *     user does not have READ permissions.
 */
const _ReadDocument_ = (event, doc_name, data_only=false, collection=COLLECTION) => {

  const firstName = _firstNameOnly(event)
  let object = Object()

  // [CASE] Check ALLOWREAD Permissions:
  if (ALLOWREAD.includes(firstName)) {
    const req = fs.getDocument(`${collection}/${doc_name}`)
    const res = doGet(req)
    // [CASE] Requesting Data Only:
    if (data_only) { object = res.obj }
    // [CASE] Requesting Entire Doc:
    else { object = res }
  }

  return object
}


/**
 * Updates the data of a specific document in a given collection.
 * @param {object} event The Google Chat event.
 * @param {string} doc_name The name/id of the document to update.
 * @param {object} new_data The new key-value data used to update the doc.
 * @param {string=COLLECTION} collection The collection where the document can be found.
 * @param {boolean=true} only_specific Sets whether the update will only add/update the specific data
 *     from new_data, or will overwrite all the existing data of the document.
 * @return {string} A message confirming the update or denying access because of permissions.
 */
const _UpdateDocument_ = (event, doc_name, new_data,
                          collection=COLLECTION, only_specific=true) => {

  const firstName = _firstNameOnly(event)
  let message = `Sorry ${firstName}, you do not have write permissions.`

  // [CASE] Check ALLOWWRITE Permissions:
  if (ALLOWWRITE.includes(firstName)) {
    const route = `${collection}/${doc_name}`
    const req = fs.updateDocument(route, new_data, only_specific)
    const key = Object.keys(new_data)[0]
    doPost(req)
    message = `${doc_name}'s ${key} XP has been updated!`
  }                      

  return message
}


/**
 * Deletes a document given the document's name/id and collection.
 * Remember, with great power comes great responsibility!
 * @param {object} event The Google Chat event. 
 * @param {string} doc_name The name/id of the document to delete.
 * @param {string} collection The name of the collection being targetted.
 * @return {string} A message upon completion or denied access.
 */
const _DeleteDocument_ = (event, doc_name, collection) => {

  const firstName = _firstNameOnly(event)
  let message = `I'm sorry, ${firstName}. I'm afraid I can't do that. 🔴`

  // [CASE] Check ALLOWDOCDELETION Permissions:
  if (ALLOWDOCDELETION) {
    // [CASE] Check ALLOWDELETE Permissions:
    if (ALLOWDELETE.includes(firstName)) {
      // Delete the Document:
      doPost(fs.deleteDocument(`${collection}/${doc_name}`))
      // Confirmation Message:
      message = `THE DOCUMENT < ${doc_name} > HAS BEEN DESTROYED.\n\n\n   ... u monster`
    }
  }

  return message
}


/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ *
   * * * * * * * * * * * * * * * *   ATTRIBUTE CRUD OPERATIONS   * * * * * * * * * * * * * * * * 
 **~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Creates a new key-value pair attribute for each document from NAMESLIST in the provided
 *     collection.
 * @param {object} event The Google Chat event. 
 * @param {string} attr_name The attribute/key to add to each document. It's value will
 *     default to zero.
 * @param {string=} collection The collection to target.
 * @return {string} A confirmation message.
 */
const createAttribute = (event, attr_name, collection=COLLECTION) => {

  const firstName = _firstNameOnly(event)
  let message = `Sorry ${firstName}, you do not have write permissions.`
  
  // [CASE] Check ALLOWWRITE Permissions:
  if (ALLOWWRITE.includes(firstName)) {
    let newObject = Object()
    newObject[attr_name] = 0
    const attrLookup = doGet(fs.getDocument(`${collection}/Evan`))
    const keysList = Object.keys(attrLookup.obj)

    // [CASE] Attribute Already Exists --> Do Not Add:
    if (keysList.includes(attr_name)) {
      message = `It looks like the attribute: '${attr_name}' already exists.`
    }
    // [CASE] New Attribute to Add:
    else {
      let route = ''
      for (let name of NAMESLIST) {
        route = `${collection}/${name}`
        doPost(fs.updateDocument(route, newObject, true))
      }

      message = `${firstName} added attribute ${attr_name} to the XP Score Board!`
    }
  }

  return message
}


/**
 * Returns a specific attribute for the named documents and collection provided.
 * @param {object} event The Google Chat event.
 * @param {string} attr_name The name of the attribute/key to read.
 * @param {Array=NAMESLIST} names The names/ids of the documents to return data for.
 * @param {string=COLLECTION} collection The collection where the documents are stored.
 * @return {object} An object containing key-value data (i.e. {'name': attr_value}), or
 *     an empty object if the user lacks permissions.
 */
const readAttribute = (event, attr_name, names=NAMESLIST, collection=COLLECTION) => {

  const firstName = _firstNameOnly(event)
  let listObject = Object()

  // [CASE] Check ALLOWREAD Permissions:
  if (ALLOWREAD.includes(firstName)) {
    for (let name of names) {
      // Form the request:
      let req = fs.getDocument(`${collection}/${name}`)
      // Retreive just the data from the response document:
      let resData = doGet(req).obj
      // Grab the specific value in question:
      let val = resData[attr_name]
      // Add the value to our name: value listObject:
      listObject[name] = val
    }
  }

  return listObject
}


/**
 * Finds the attribute specified and replaces it with the new key-value data for a target
 *     document in a given collection.
 * @param {object} event The Google Chat event.
 * @param {object} replacement The new key-value data to replace the given attribute with.
 * @param {string} doc_id The name/id of the document to apply changes to.
 * @param {string=COLLECTION} collection The collection where the document can be found.
 * @return {string} A message confirming the changes or a lack of write permissions.
 */
const updateAttribute = (event, replacement, doc_id, collection=COLLECTION) => {

  const firstName = _firstNameOnly(event)
  let message = `Sorry ${firstName}, you do not have write permissions.`

  // [CASE] Check ALLOWWRITE Permissions:
  if (ALLOWWRITE.includes(firstName)) {
    // Store the attribute/key we're looking to change:
    const key = Object.keys(replacement)[0]
    // Form the route to our document:
    const route = `${collection}/${doc_id}`
    // Retreive the document and grab its data:
    const docData = fs.getDocument(route).obj
    // Create an Array of all the keys in the returned data:
    const docKeys = Object.keys(getData)

    // [CASE] Attribute Already Exists:
    if (docKeys.includes(key)) {
      doPost(fs.updateDocument(route, replacement, true))
      keysValue = docData[key]
      message = `The attribute ${key} has been updated for ${doc_id}.`
    }
    // [CASE] Attribute DNE:
    else {
      message = `Sorry, it looks like the attribute: '${key}' does not already exist.` +
                "\nPlease add it to Score Keeper before making any updates."
    }
  }
  
  return message
}


/**
 * Deletes a key-value pair attribute from each document in the given collection.
 * @param {object} event The Google Chat event.
 * @param {string} attr_name The attribute/key to remove from each document.
 * @param {string} collection The collection being targetted.
 * @return {string} A confirmation that the task has been completed or denied due
 *     to lack of permissions.
 */
const _deleteAttribute = (event, attr_name, collection=COLLECTION) => {

  const firstName = _firstNameOnly(event)
  let message = `Sorry ${firstName}, you do not have delete permissions.`

  // [CASE] Check ALLOWDELETE Permissions:
  if (ALLOWDELETE.includes(firstName)) {
    // [CASE] Don't Delete Underscore Attributes:
    if (attr_name[0] == '_') {
      message = "The attribute specified is protected." + 
                "Contact your Database Admin for more information."
    }
    // [CASE] Delete the Normal Attribute:
    else {
      for (let name of NAMESLIST) {
        let route = `${collection}/${name}`
        let res = doGet(fs.getDocument(route))
        let data = res.obj
        const keysList = Object.keys(data)
  
        // [CASE] Given Attribute Exists:
        if (keysList.includes(attr_name)) {
          // Store the value of the attribute to delete:
          attrXP = data[attr_name]  
          // Delete the attribute from the data object:
          delete data[attr_name]
          // Subtract from the _totalXP calculation:
          let totalXP = data['_totalXP']
          data['_totalXP'] = totalXP - attrXP
          // Update the document with the new data.
          doPost(fs.updateDocument(route, data))
          message = `${firstName} removed the attribute ${attr_name} from the XP Score Board!`
        }
        // [CASE] Given Attribute DNE:
        else {
          message = `No such attribute: '${attr_name}'.`
        }
      }
    }
  }

  return message
}

