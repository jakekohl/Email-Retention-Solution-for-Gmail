/****
 * This Script will apply different e-mail policies according to a defined set of labels
 * Actions:
 *  - Delete: will delete (move) the message thread to the trash (unless starred)
 * 
 * New policies: To add a new policy, add a new entry in the "policies" map
 * 
 * When executing the action, the corresponding label will be removed. This will speed up the  
 * processing of messages considerably (otherwise, the messages would be reprocessed on every run).
 * Starred messages will not be deleted.
 *
 * By setting a timed trigger, you can execute the script in regular intervals (e.g. every 30 minutes)
 * Create a filter that will apply a specific label automatically to the filtered mail and 
 * your mailbox will unclutter itself automatically.
 * 
 * Inspired/adapted from https://www.maketecheasier.com/google-scripts-to-automate-gmail/
 * 
 * Shamelessly forked and customized for myself from: https://gist.github.com/johannrichard/bf16d81a60dfbfff110d0824f2cdde87 
 */

function applyEmailPolicy() {  
  var policies = {

    // Delete Policies
    "dailyDelete": {"label": "Delete Nightly", days: 2, action: "delete"}, 
    "monthDelete": { "label": "Delete After 30 Days", days: 30, action: "delete" },
    "quarterlyDelete": { "label": "Delete After 90 Days", days: 90, action: "delete" },
    "halfYearDelete": { "label": "Delete After 180 Days", days: 180, action: "delete" },
    "yearDelete": { "label": "Delete After 1 Year", days: 365, action: "delete"},
    "twoYearDelete": {"label": "Delete After 2 Years", days: 730, action: "delete"}, 
    "halfDecadeDelete": { "label": "Delete After 5 Years", days: 1825, action: "delete"},
    "decadeDelete": { "label": "Delete After 10 Years", days: 3650, action: "delete"},
  }

  for (var policyKey in policies) {
    var policy = policies[policyKey];
    Logger.log("Applying E-Mail Policy '" + policy["label"] + "'");
    var label = GmailApp.getUserLabelByName(policy["label"]);

    if(label == null){
      GmailApp.createLabel(policy["label"]);
      Logger.log("Created new Label: '" + policy["label"] + "'")
    } else {
      var delayDays = policy["days"]; 
      var maxDate = new Date(); 
      maxDate.setDate(maxDate.getDate()-delayDays);    

      var threads = label.getThreads();  
      for (var i = 0; i < threads.length; i++) {  
        if (threads[i].getLastMessageDate()<maxDate){  
          switch(policy["action"]) {
            case "delete":
              if(!threads[i].hasStarredMessages()) {
                Logger.log("Deleting Thread '" + threads[i].getFirstMessageSubject() + "'");
                threads[i].removeLabel(label);
                threads[i].moveToTrash();
              } else {
                Logger.log("Skipping Thread '" + threads[i].getFirstMessageSubject() + "'");
              }
              break;
          }
        } 
      } 
    }
  } 
}