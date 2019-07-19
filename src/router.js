import Vue from 'vue'
import Router from 'vue-router'

import ContentUsers from './components/ContentUsers.vue';
import ContentProjects from './components/ContentProjects.vue'
import ContentVariables from './components/ContentVariables.vue'
import ContentLogin from './components/ContentLogin.vue'
import ContentWelcome from './components/ContentWelcome.vue'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [
        { path:'/login', component: ContentLogin },
        { path: '/users', component: ContentUsers },
        { path: '/projects', component: ContentProjects },
        { path: '/variables', component: ContentVariables },
        { path: '/welcome', component: ContentWelcome },
        { path: '/*', redirect: '/login' } // otherwise redirect to home
      ]
});

router.beforeEach((to, from, next) => {
    const publicPages = ['/login'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = localStorage.getItem('user_session');

    if (authRequired && !loggedIn) {
        return next('/login');
    }

    next();
})

export default router;
