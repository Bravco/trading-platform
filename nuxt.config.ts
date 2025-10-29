export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@pinia/nuxt", "@nuxt/image", "reka-ui/nuxt"],
  css: ["~/assets/css/main.css", "~/assets/css/icomoon.css"],
  icon: {
    customCollections: [
      {
        prefix: "custom",
        dir: "./app/assets/icons"
      }
    ]
  }
})