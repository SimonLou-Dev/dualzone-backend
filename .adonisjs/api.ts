import type { MakeTuyauRequest, MakeTuyauResponse } from '@tuyau/utils/types'
import type { InferInput } from '@vinejs/vine/types'

type AuthSteamAuthenticateGetHead = {
  request: unknown
  response: MakeTuyauResponse<import('../app/controllers/User/user_auths_controller.ts').default['steamCallback']>
}
type AuthSteamGetHead = {
  request: unknown
  response: MakeTuyauResponse<import('../app/controllers/User/user_auths_controller.ts').default['steamAuth']>
}
type UserIdGetHead = {
  request: unknown
  response: MakeTuyauResponse<import('../app/controllers/User/user_controller.ts').default['show']>
}
export interface ApiDefinition {
  'auth': {
    'steam': {
      'authenticate': {
        '$url': {
        };
        '$get': AuthSteamAuthenticateGetHead;
        '$head': AuthSteamAuthenticateGetHead;
      };
      '$url': {
      };
      '$get': AuthSteamGetHead;
      '$head': AuthSteamGetHead;
    };
  };
  'user': {
    ':id': {
      '$url': {
      };
      '$get': UserIdGetHead;
      '$head': UserIdGetHead;
    };
  };
}
const routes = [
  {
    params: ["*"],
    name: 'drive.fs.serve',
    path: '/uploads/*',
    method: ["GET","HEAD"],
    types: {} as unknown,
  },
] as const;
export const api = {
  routes,
  definition: {} as ApiDefinition
}
