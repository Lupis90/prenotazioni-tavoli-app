import { defineRouter } from '#q-app/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { supabase } from '../supabase'

export default defineRouter(function() {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory()
  })

  Router.beforeEach(async (to, from, next) => {
    const { data: { session } } = await supabase.auth.getSession()

    // Verifica se la route richiede autenticazione
    if (to.meta.requiresAuth && !session) {
      // Redirect to login page with redirect back URL
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
    }
    // Verifica se la route richiede admin
    else if (to.meta.requiresAdmin) {
      if (!session) {
        next({ name: 'login' })
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()

        if (profile?.is_admin) {
          next()
        } else {
          next({ name: 'home' })
        }
      }
    }
    else {
      next()
    }
  })

  return Router
})
