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
const NAMESLIST = ['Evan', 'Sara', 'McCauley', 'Brandon', 'Dana', 'Kiersten']
// Users with READ permissions:
const ALLOWREAD = ['Evan', 'Sara', 'McCauley', 'Brandon', 'Dana', 'Kiersten']
// Users with WRITE permissions:
const ALLOWWRITE = ['Evan']
// Users with DELETE permissions:
const ALLOWDELETE = ['Evan']
// ON/OFF Switch for Document Deletions:
const ALLOWDOCDELETION = false
// A Safe Place to Store Our Firebase Project Credentials:
const PROPS = PropertiesService.getUserProperties()


/** ========================================================================================== *
    == == == == == == == == == == == == HELPER FUNCTIONS  == == == == == == == == == == == ==
 ** ========================================================================================== */

/**
 * Helper function retreives just the first name of the user sending a chat's message.
 * @param {object} event The event object from Hangouts Chat.
 * @return {string} The first name from the user's chat display name.
 */
const _firstNameOnly = (event) => {
  // Grab the display name:
  const displayName = event.user.displayName
  // Split the name at the space and store as an array:
  const splitName = displayName.split(" ", 2)
  // Return just the first name:
  return splitName[0]
}


// Handles GET requests.
const doGet = (e) => e

// Handles POST requests.
const doPost = (e) => e


/** ========================================================================================== *
    == == == == == == == == == == FIRESTORE CLOUD DATABASE STUFF == == == == == == == == == ==
 ** ========================================================================================== */

// Store Credential Properties:
const [email, key, project_id] = [PROPS.getProperty('client_email'),
                                  PROPS.getProperty('private_key'),
                                  PROPS.getProperty('project_id')]

// Create a Firestore object & authenticate:
const fs = FirestoreApp.getFirestore(email, key, project_id)  


/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ *
   * * * * * * * * * * * * * * * *   DOCUMENT CRUD OPERATIONS   * * * * * * * * * * * * * * * * 
 **~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Creates a new document in the given collection by specifying the name/id and data to add.
 * 
 * @param {object} event The Google Chat event.
 * @param {string} doc_name The new documents name/id value.
 * @param {object=DEFAULTDOC} data The key-value data to initialize in the document.
 * @param {string=COLLECTION} collection The collection to add to.
 * @return {string} message A message that the doc was created, or access was denied.
 */
const _CreateDocument_ = (event, doc_name, data=DEFAULTDOC, collection=COLLECTION) => {

  const firstName = _firstNameOnly(event)
  let message = ''

  // [CASE] check ALLOWWRITE Permissions:
  if (ALLOWWRITE.includes(firstName)) {
    // The create document request:
    const req = fs.createDocument(`${collection}/${doc_name}`, data)
    // POST the request & store data returned:
    const res = doPost(req)
    // Take object returned by POST request & select just the data as JSON.
    const parse = JSON.stringify(res.obj)
    // Confirmation message.
    message = `Created a new peep in ${collection}!\n${doc_name}: ${parse}`
  } 
  // [CASE] Access Denied:
  else {
    message = `Sorry ${firstName}, you do not have write permissions.`
  }

  return message
}


/**
 * Retreives a document from a collection based on the document's name/id.
 * 
 * @param {object} event The Google Chat event.
 * @param {string} doc_name The document name/id value to look for.
 * @param {boolean=false} just_data Whether to read in just the data of the doc, or the whole thing.
 * @param {string=COLLECTION} collection The name of the collection where the document can be found.
 * @return {object} The document object (or just its data) as JSON. Returns false if
 *     the user does not have READ permissions.
 */
const _ReadDocument_ = (event, doc_name, just_data=false, collection=COLLECTION) => {

  const firstName = _firstNameOnly(event)
  let object = {}

  // [CASE] Check ALLOWREAD Permissions:
  if (ALLOWREAD.includes(firstName)) {
    const req = fs.getDocument(`${collection}/${doc_name}`)
    const res = doGet(req)
    if (just_data) { object = res.obj }
    else { object = res }
  }
  // [CASE] Access Denied:
  else {
    object =  false
  }

  return object
}


/**
 * Updates the data of a specific document in a given collection.
 * 
 * @param {object} event The Google Chat event.
 * @param {string} doc_name The name/id of the document to update.
 * @param {object} new_data The new key-value data used to update the doc.
 * @param {string=COLLECTION} collection The collection where the document can be found.
 * @param {boolean=true} only_specific Sets whether the update will only affect the specific data
 *     from new_data, or will override all the existing data of the document.
 * @return {string} message A message confirming the update or denying access because of permissions.
 */
const _UpdateDocument_ = (event, doc_name, new_data, collection=COLLECTION, only_specific=true) => {

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
 * Deletes a specific document given the document name/id and collection.
 * With great power comes great responsibility!
 * 
 * @param {object} event The Google Chat event. 
 * @param {string} doc_name The name/id of the document to delete.
 * @param {string} collection The name of the collection being targetted.
 * @return {string} message A message upon completion or denied access.
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

