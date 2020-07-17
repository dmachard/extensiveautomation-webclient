import Vue from 'vue'
import Router from 'vue-router'

import ContentUsers from './components/ContentUsers.vue';
import ContentProjects from './components/ContentProjects.vue'
import ContentVariables from './components/ContentVariables.vue'
import ContentLogin from './components/ContentLogin.vue'
import ContentDashboard from './components/ContentDashboard.vue'
import ContentJobs from './components/ContentJobs.vue'
import ContentRuns from './components/ContentRuns.vue'
import ContentEditor from './components/ContentEditor.vue'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [
        { path:'/login', component: ContentLogin },
        { path: '/users', component: ContentUsers },
        { path: '/projects', component: ContentProjects },
        { path: '/globals', component: ContentVariables },
        { path: '/dashboard', component: ContentDashboard },
        { path: '/jobs', component: ContentJobs },
        { path: '/executions', component: ContentRuns },
        { path: '/editor', component: ContentEditor },
        { path: '/*', redirect: '/login' } // otherwise redirect to home
      ]
});

router.beforeEach((to, from, next) => {
    const publicPages = ['/login']
    const authRequired = !publicPages.includes(to.path)
    const loggedIn = localStorage.getItem('user_session')

    if (authRequired && !loggedIn) {
        return next('/login')
    }
    next()
})

export default router;
