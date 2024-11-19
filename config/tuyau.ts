import { defineConfig } from '@tuyau/core'

const tuyauConfig = defineConfig({
  codegen: {
    /**
     * Filters the definitions and named routes to be generated
     */
    // definitions: {
    //  only: [],
    // }
    // routes: {
    //  only: [],
    // }
  },
  openapi: {
    documentation: {
      info: { title: 'Dualzone API', version: '0.1.0', description: 'Dualzone API Backend' },
    },
  },
})

export default tuyauConfig
