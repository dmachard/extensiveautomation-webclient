import axios from 'axios'
import Vue from 'vue'
import { EventBus } from '@/main'

export const BackendApi = new Vue({
    methods: {
      execute(method, resource, data){
        // prepare the basic auth
        var user = localStorage.getItem('user_session')
        if(user === null || user === undefined) {
          EventBus.$emit('ApiAuthenticationError', "error to reach backend")
          return null
        }

        const user_json =  JSON.parse(user)
        var basic_auth = btoa( `${user_json.api_login}:${user_json.api_secret}`)

        var http_client = axios.create({
          baseURL: `${user_json.api_url}${user_json.api_path}`,
          json: true
         })

        // execute the request
        return http_client({
          method,
          url: resource,
          data,
          headers: {
           Authorization: `Basic ${basic_auth}`
          }
        }).then(resp => { 
          return resp.data
        }).catch(error => {
          if ( error.response != undefined ) {
            if ( error.response.status == 401 ) {
              EventBus.$emit('ApiAuthenticationError', error)
            } else {
              EventBus.$emit('ApiError', error)
            }
          } else {
            EventBus.$emit('ApiFatal', error)
          }
        })
      },
      loginUser(apiurl, apipath, login, password){
        var body = { 'login': login, 'password': password }
        return axios.post(`${apiurl}${apipath}session/login`, body)
                    .then(response => {
                      if (response.data.session_id && response.data.api_secret && response.data.api_login) {
                        // append the initial url in response
                        response.data["api_url"] = apiurl
                        response.data["api_path"] = apipath

                        // return response
                        return response.data
                      } else {
                        EventBus.$emit('ApiError', "server not supported ")
                      }

                    }
                    ).catch(error => {
                      if ( error.response != undefined ) {
                        if ( error.response.status == 401 ) {
                          EventBus.$emit('ApiAuthenticationError', error)
                        } else {
                          EventBus.$emit('ApiError', error)
                        }
                      } else {
                        EventBus.$emit('ApiFatal', error)
                      }
                    })
      },
      updatePassword(id, currentpassword, newpassword){
        var body = {"user-id": id, "current-password": currentpassword, "new-password": newpassword}
        return this.execute('post', '/administration/users/password/update', body)
      },
      addVariable(name, content, projectId){
        var body = {
                      "variable-name": name, 
                      "variable-value": content, 
                      "project-id": projectId
                    }
        return this.execute('post', '/variables/add', body)
      },
      updateVariable(id, name, content, prjid){
        var body = {
          "variable-id": id,
          "variable-name": name, 
          "variable-value": content, 
          "project-id": prjid
        }
        return this.execute('post', '/variables/update', body)
      },
      deleteVariable(id, prjid){
        var body = {"variable-id": id, "project-id": prjid}
        return this.execute('post', '/variables/remove', body)
      },
      getVariables(id){
        var body = { "project-id": id }
        return this.execute('post', '/variables/listing', body)
      },
      getTests(prjid){
        var body = { "project-id": prjid }
        return this.execute('post', '/tests/listing', body)
      },
      getUser(id){
        var body = {"user-id": id}
        return this.execute('post', '/administration/users/profile', body)
      },
      getUsers(){
        return this.execute('get', '/administration/users/listing')
      },
      deleteUser(id){
        var body = {"user-id": id}
        return this.execute('post', '/administration/users/remove', body)
      },
      addUser(login, password, email, level, projects, defprj, lang, style, notifications){
        var body = {"login": login, "password": password, "email": email, 
                    "level": level, "projects": projects, "lang": lang,
                    "style": style, "notifications": notifications,
                    "default": defprj }
        return this.execute('post', '/administration/users/add', body)            
      },
      updateUser(id, login, email,level, projects, defprj, lang, style, notifications){
        var body = { "user-id": id, "login": login, "email": email, 
                    "level": level, "projects": projects, "lang": lang,
                    "style": style, "notifications": notifications,
                    "default": defprj }
        return this.execute('post', '/administration/users/update', body)
      },
      resetUserPassword(id){
        var body = { "user-id": id }
        return this.execute('post', '/administration/users/password/reset', body)
      },
      getProjects() {
        return this.execute('get', '/administration/projects/listing')
      },
      addProject(name) {
        var body = {"project-name": name}
        return this.execute('post', '/administration/projects/add', body)
      },
      deleteProject(id){
        var body = {"project-id": id}
        return this.execute('post', '/administration/projects/remove', body)
      },
      renameProject(id, name){
        var body = {"project-id": id, "project-name": name}
        return this.execute('post', '/administration/projects/rename', body)
      },
      getTasksCompleted(){
        return this.execute('get', '/tasks/history')
      },
      getTasksRunning(){
        return this.execute('get', '/tasks/running')
      },
      getTasksScheduled(){
        return this.execute('get', '/tasks/waiting')
      },
      getTasksListing(){
        return this.execute('get', '/tasks/listing')
      },
      cancelTask(id){
        var body = { "task-id": id }
        return this.execute('post', '/tasks/cancel', body)
      },
      killTask(id){
        var body = { "task-id": id }
        return this.execute('post', '/tasks/kill', body)
      },
      replayTask(id){
        var body = { "task-id": id }
        return this.execute('post', '/tasks/replay', body)
      },
      removeTask(id){
        var body = { "task-id": id }
        return this.execute('post', '/tasks/remove', body)
      },
      scheduleTask(testprjid, testname, testext, testpath, schedid, repeat, y, m, d, h, mn, s){
        var body = { "project-id": testprjid, "test-name": testname, 
                     "test-extension": testext, "test-path": testpath,
                     "schedule-id": schedid, "schedule-repeat": repeat, 
                     "schedule-at": [y, m, d, h, mn, s] }
        return this.execute('post', '/tasks/schedule', body)
      },
      getScriptsListing(id){
        var body = { "project-id": id }
        return this.execute('post', '/tests/listing/dict', body)
      }
    }
})