import '@expo/router';

declare module '@expo/router' {
  export type PathName =
    | '/onboarding'
    | '/connect-device'
    | '/debug'
    | '/questionnaire'
    | '/relaxation-moments'
    | '/';

  export type RelativePathString = `./${string}` | `../${string}`;
  export type AbsolutePathString = `/${string}`;
  export type ExternalPathString = `http${string}`;
} 