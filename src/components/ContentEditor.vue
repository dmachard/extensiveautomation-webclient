<template>
  <v-container >
      <v-dialog  
            v-model="dialog" 
             fullscreen hide-overlay
        >
        
            <v-card height="100%">
                <v-toolbar dark >
                    <v-btn icon dark @click="dialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Open File</v-toolbar-title>
                    <v-spacer></v-spacer>
                    </v-toolbar>

                <v-card-text >
                    <v-container>
                            <v-select
                                v-model="project_select"
                                :items="projects_list"
                                label="Workspace"
                                prepend-icon="dashboard"
                                @input="onProjectChanged"
                            ></v-select>
                            
                            <v-breadcrumbs :items="script_nav">
                                <template v-slot:item="props">
                                    <a @click="onClickNav(props.item.id)" >{{props.item.text}}</a>
                                </template>
                            </v-breadcrumbs>
                            <v-list height="500px" >
                                <v-list-item
                                    v-for="item in items_list"
                                    :key="item.title" 
                                    @click="onClickFolder(item.id)"
                                >
                                    <v-list-item-avatar>
                                        <v-icon >{{ item.icon }}</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                                <v-list-item
                                    v-for="item in items2_list"
                                    :key="item.id"
                                    @click="onClickFile(item.id)"
                                >
                                    <v-list-item-avatar>
                                        <v-icon>{{ item.icon }}</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                            </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog  
            v-model="dialog_folders" 
            max-width="900px"
            persistent
            transition=""
            no-click-animation
            scrollable 
        >
            <v-card >
                <v-card-title>
                    <span class="headline">Save File</span>
                </v-card-title>
                <v-divider></v-divider>
                    <v-stepper v-model="stepper" style="height: 500px;" >
                    <v-stepper-header>
                        <v-stepper-step step="1"  editable >Select Folder</v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step step="2" editable>Set name</v-stepper-step>    
                    </v-stepper-header>
                    <v-stepper-items>
                        <v-stepper-content step="1"  >
                            <v-select
                                v-model="project_select"
                                :items="projects_list"
                                label="Workspace"
                                prepend-icon="dashboard"
                                @input="onProjectChanged"
                            ></v-select>
                            <v-breadcrumbs :items="script_nav">
                                <template v-slot:item="props">
                                    <a @click="onClickNav(props.item.id)" >{{props.item.text}}</a>
                                </template>
                            </v-breadcrumbs>
                            <v-list subheader>
                                <v-list-item
                                    v-for="item in items_list"
                                    :key="item.title" 
                                    @click="onClickFolder(item.id)"
                                >
                                    <v-list-item-avatar>
                                        <v-icon >{{ item.icon }}</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                     </v-stepper-content>
                        <v-stepper-content step="2">
                            <v-layout row>
                                <v-flex xs4>
                                    <v-subheader>Path</v-subheader>
                                </v-flex>
                                <v-flex xs8>
                                    <v-text-field
                                        :value="current_path"
                                        readonly
                                        ></v-text-field>
                                </v-flex>
                            </v-layout>
                             <v-layout row>
                                <v-flex xs4>
                                    <v-subheader>Filename</v-subheader>
                                </v-flex>
                                <v-flex xs8>
                                    <v-text-field v-model="new_filename" ></v-text-field>
                                </v-flex>
                            </v-layout>
                    </v-stepper-content>
                    </v-stepper-items>
                </v-stepper>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="hideFiles">Cancel</v-btn>
                    <v-btn color="blue darken-1" :disabled="stepper == 1" v-if="new_filename.length != 0" text @click="uploadFile">SAVE</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


      <v-layout >
      <v-flex  >
          <v-card>
          <v-card-title>
                    <v-btn 
                      class="mx-2"
                      dark
                      color="green" @click="showFiles"  >
                      OPEN FILE
                    </v-btn>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :disabled="! is_modified" text @click="saveChanges" v-bind="attrs" v-on="on">
                                 <v-icon>save</v-icon>
                            </v-btn>
                        </template>
                        <span>Save File</span>
                    </v-tooltip>

                    
                    
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                             <v-btn @click="deleteFile" :disabled='current_file == ""' text color="red" v-bind="attrs" v-on="on" >
                                <v-icon>delete</v-icon>
                            </v-btn>
                        </template>
                        <span>Delete File</span>
                    </v-tooltip>
                    
                       
                    <v-spacer></v-spacer>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn @click="clearFile" :disabled='current_file == ""' text v-bind="attrs" v-on="on" >
                                <v-icon>close</v-icon>
                            </v-btn>
                        </template>
                        <span>Close File</span>
                    </v-tooltip>

                    

          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
              <v-label>File: {{current_file}}</v-label>
              <editor ref='editor' v-model="file_content" lang="yaml" theme="chrome" width="100%" height="500px" @init="init_editor"></editor>
          </v-card-text>
        </v-card> 
      </v-flex>
    </v-layout>
  </v-container> 
</template>

<script>
  import { BackendApi } from '@/backend.js'
  const aceeditor = require('vue2-ace-editor')

  export default {
      components: {
        editor: aceeditor
     },
      data() {
          return {
            dataprojects: [],
            file_content: '',
            is_modified: false,
            is_ready: true,
            dialog: false,
            dialog_folders: false,
            project_select: 1,
            projects_list: [ {"text": "Common", "value": 1} ],
            script_nav: [  {text: 'Root', id: "00"} ],
            items_list: [],
            items2_list: [],
            current_file: "",
            current_path: "/",
            stepper: 1,
            new_filename: ""
          }
      },
      methods: {
          clearFile(){
              this.current_file = ""
              this.current_path = "/"
              this.file_content = ""
              this.new_filename = ""
              this.is_modified = false
              this.is_ready = true
          },
           onProjectChanged(){
            // reset the tr,ee
            this.items_list = []
            this.items2_list = []
            this.script_nav =[  {text: 'Root', id: "00"} ]

            // and reload
            this.getFilesListing()
        },
            openFile(){
                
            },
            async deleteFile(){
                if (this.current_file == "") {
                    return
                }

                await BackendApi.deleteFile(this.project_select, this.current_file)

                this.clearFile()
                this.onProjectChanged()
            },
           showFiles(){
               this.onProjectChanged()
               
              // show the form
              this.dialog = true
           },
           hideFiles(){
                this.dialog = false
                this.dialog_folders = false
            },
           init_editor:function (editor) {
                editor.getSession().setUseWrapMode(true)
                editor.setFontSize("14px");
                require('brace/mode/yaml')
                require('brace/theme/chrome')

                editor.session.on('change', this.onEditorChanged)

                editor.commands.addCommand({
                    name: 'save',
                    bindKey: {win: "Ctrl-S", "mac": "Cmd-S"},
                    exec: this.saveChanges
                })
            },
            onEditorChanged(){
               if (this.is_ready == true){
                    this.is_ready = false
                    return
                }
                this.is_modified = true
            },
            async saveChanges(){
                if (this.is_modified == false){
                    return
                }

                if (this.current_file == "") {
                    this.dialog_folders = true
                } else {
                    var file_content = window.btoa(unescape(encodeURIComponent(this.file_content)))
                    await BackendApi.uploadFile(this.project_select, this.current_file, file_content)
                    this.is_modified = false
                }
            },
            async uploadFile(){
                this.current_file = this.current_path +  this.new_filename

                var file_content = window.btoa(unescape(encodeURIComponent(this.file_content)))
                await BackendApi.uploadFile(this.project_select, this.current_file, file_content)
                this.is_modified = false

                this.dialog_folders = false
            },
            setCurrentPath(id){
                if (id == "00") {
                    this.current_path = "/"
                    return
                }

                // construct the path of the script
                var path_tmp_list = []
                var item_tmp = this.script_listing[id]
                while( item_tmp["parent-id"] != "00"){
                    if (item_tmp.type == "folder") {
                        path_tmp_list.push( item_tmp.name )
                    } 
                    item_tmp = this.script_listing[item_tmp["parent-id"]]
                }
                if (item_tmp.type == "folder") {
                    path_tmp_list.push( item_tmp.name )
                } 
                path_tmp_list = path_tmp_list.reverse()

                // convert path to string
                var path_str = "/"
                for (var i = 0; i < path_tmp_list.length; ++i) {
                    path_str += path_tmp_list[i]
                    path_str += "/"
                }

                this.current_path = path_str
            },
            async onClickFile(id){
                this.clearFile()
                
                //save the current item 
                this.selected_script = this.script_listing[id]

                // construct the path of the script
                this.setCurrentPath(id)

                this.current_file =  this.current_path + this.selected_script.name + "." + this.selected_script.extension 
                var ret = await BackendApi.downloadFile(this.project_select, this.current_file)
                this.file_content = decodeURIComponent(escape(window.atob(ret["file-content"])))

                this.dialog = false
            },
            onClickNav(id){
                // clear the navigation menu of the tree
                var new_nav = []
                for (var i = 0; i < this.script_nav.length; ++i) {
                    if ( this.script_nav[i].id != id ){
                        new_nav.push( this.script_nav[i] )
                    } else {
                        break
                    }
                }

                // apply the new navigation menu
                this.script_nav = new_nav

                // reload the tree
                this.onClickFolder(id)
            },
            onClickFolder(id){
                this.setCurrentPath(id)

                // clear the tree (folders and files)
                this.items_list = []
                this.items2_list = []

                // update the navigation menu of the tree
                this.script_nav.push( {text: this.script_listing[id].name, id: id}  )

                // load the tree
                for (var key in this.script_listing){
                    if ( this.script_listing[key]["parent-id"] == id && this.script_listing[key].type == "folder" ) {
                        this.items_list.push( { icon: "folder",
                                                title: this.script_listing[key].name, 
                                                id: key } )
                    }

                    if ( this.script_listing[key]["parent-id"] == id && this.script_listing[key].type == "file" ) {
                        if (this.script_listing[key].extension == "yml") {
                            this.items2_list.push( { icon: "description",
                                                    title: this.script_listing[key].name, 
                                                    id: key } )
                        }
                    }
                }
            },
            getFilesListing(){
                BackendApi.getScriptsListing(this.project_select).then(resp => {
                    if ( resp != undefined) {
                        this.script_listing = resp.listing
                        this.script_listing["00"] = {"name": "Root", "type": "root"}
                        for (var key in this.script_listing){
                            if ( this.script_listing[key]["parent-id"] == "00" && this.script_listing[key].type == "folder" ) {
                                this.items_list.push( { icon: "folder",
                                                        title: this.script_listing[key].name, 
                                                        id: key } )
                            }
                            if ( this.script_listing[key]["parent-id"] == "00" && this.script_listing[key].type == "file" ) {
                                if (this.script_listing[key].extension == "yml") {
                                    this.items2_list.push( { icon: "description",
                                                            title: this.script_listing[key].name, 
                                                            id: key } )
                                }
                            }
                        }
                    }
                })
            },
      },

      async created () {
            // retrieve user from local storage
        const user =  localStorage.getItem('user_session');
        const user_json =  JSON.parse(user)

        // get projects according to the user, 
        // waiting response before to continue
        this.dataprojects = await BackendApi.getProjectsGranted(user_json)

        for (var i = 0; i < this.dataprojects.length; ++i) {
            this.projects_list.push(
                {
                    "text": this.dataprojects[i]["name"], 
                    "value": this.dataprojects[i]["id"] 
                    } 
                )
        }

        // retrieve all scripts
        this.getFilesListing()
     },
     

  }
</script>

<style scoped>
.v-list {
  height: 250px;
  overflow-y: auto;
}
</style>