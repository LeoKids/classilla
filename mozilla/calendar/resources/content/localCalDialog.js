/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is OEone Calendar Code, released October 31st, 2001.
 *
 * The Initial Developer of the Original Code is
 * OEone Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): Garth Smedley <garths@oeone.com>
 *                 Mike Potter <mikep@oeone.com>
 *                 Colin Phillips <colinp@oeone.com> 
 *                 Chris Charabaruk <ccharabaruk@meldstar.com>
 *                 ArentJan Banck <ajbanck@planet.nl>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */



/***** calendar/localCalDialog.js
* AUTHOR
*   Mike Potter
* REQUIRED INCLUDES 
*
* NOTES
*   Code for creating a new local calendar.
*
*  Invoke this dialog to create a new event as follows:

   var args = new Object();
   args.mode = "new";               // "new" or "edit"
   args.onOk = <function>;          // funtion to call when OK is clicked
    
   calendar.openDialog("caNewCalendar", "chrome://calendar/content/localCalDialog.xul", true, args );
*
*  Invoke this dialog to edit an existing event as follows:
*
   var args = new Object();
   args.mode = "edit";                    // "new" or "edit"
   args.onOk = <function>;                // funtion to call when OK is clicked

* When the user clicks OK the onOk function will be called with a calendar event object.
*
*  
* IMPLEMENTATION NOTES 
**********
*/


/*-----------------------------------------------------------------
*   W I N D O W      V A R I A B L E S
*/


var gCalendarObject;          // event being edited
var gOnOkFunction;   // function to be called when user clicks OK

var gMode = ''; //what mode are we in? new or edit...

/*-----------------------------------------------------------------
*   W I N D O W      F U N C T I O N S
*/

/**
*   Called when the dialog is loaded.
*/

function loadCalendarServerDialog()
{
   // Get arguments, see description at top of file
   
   var args = window.arguments[0];
   
   gMode = args.mode;
   
   gOnOkFunction = args.onOk;
   gCalendarObject = args.CalendarObject;
   
   // mode is "new or "edit" - show proper header
   var titleDataItem = null;

   if( "new" == args.mode )
   {
      titleDataItem = document.getElementById( "data-event-title-new" );
   }
   else
   {
      titleDataItem = document.getElementById( "data-event-title-edit" );

      document.getElementById( "server-path-textbox" ).setAttribute( "readonly", "true" );
   }
   
   document.getElementById( "calendar-serverwindow" ).setAttribute( "title", titleDataItem.getAttribute( "value" ) );

   document.getElementById( "server-name-textbox" ).value = gCalendarObject.name;

   document.getElementById( "server-path-textbox" ).value = gCalendarObject.path;

   document.getElementById( "server-remotepath-textbox" ).value = gCalendarObject.remotePath;
   
   document.getElementById( "server-username-textbox" ).value = gCalendarObject.username;

   document.getElementById( "server-password-textbox" ).value = gCalendarObject.password;

   document.getElementById( "server-publish-checkbox" ).checked = gCalendarObject.publishAutomatically;
   
   // start focus on title
   
   var firstFocus = document.getElementById( "server-name-textbox" );
   firstFocus.focus();

   sizeToContent();
}



/**
*   Called when the OK button is clicked.
*/

function onOKCommand()
{
   gCalendarObject.name = document.getElementById( "server-name-textbox" ).value;

   gCalendarObject.path = document.getElementById( "server-path-textbox" ).value;

   gCalendarObject.remotePath = document.getElementById( "server-remotepath-textbox" ).value;
   
   gCalendarObject.username = document.getElementById( "server-username-textbox" ).value;

   gCalendarObject.password = document.getElementById( "server-password-textbox" ).value;

   gCalendarObject.publishAutomatically = document.getElementById( "server-publish-checkbox" ).checked;
   
   // call caller's on OK function
   gOnOkFunction( gCalendarObject );
      
   // tell standard dialog stuff to close the dialog
   return true;
}


function launchFilePicker()
{
   // No show the 'Save As' dialog and ask for a filename to save to
   const nsIFilePicker = Components.interfaces.nsIFilePicker;

   var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);

   // caller can force disable of sand box, even if ON globally

   fp.init(window, "Save", nsIFilePicker.modeSave);

   var ServerName = document.getElementById( "server-name-textbox" ).value;

   if( ServerName == "" )
      fp.defaultString = "MozillaCalendarFile.ics";
   else
      fp.defaultString = "MozillaCalendar"+ServerName+".ics";
   
   fp.defaultExtension = "ics";

   const filterCalendar    = "Calendar Files";
   const extensionCalendar = ".ics";
   fp.appendFilter( filterCalendar, "*" + extensionCalendar );
   
   fp.show();

   if (fp.file && fp.file.path.length > 0)
   {
      document.getElementById( "server-path-textbox" ).value = fp.file.path;

      gCalendarObject.path = fp.file.path;

      if( document.getElementById( "server-name-textbox" ).value == "" )
      {
         var fullPathRegex = new RegExp(".*[/\\\\:]([^/\\\\:]+)[\.]ics$");
            
         var filename;
          
         if (fullPathRegex.test(fp.file.path))
            filename = fp.file.path.replace(fullPathRegex, "$1");
            
         document.getElementById( "server-name-textbox" ).value = filename;
      }
   }
}
