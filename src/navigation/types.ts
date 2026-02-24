export type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
  Create: undefined;
  Editor: {projectId: string};
  Preview: {projectId: string};
  Export: {projectId?: string};
  ProjectDetails: {projectId: string};
};

export type MainTabsParamList = {
  Projects: undefined;
  ExportHub: undefined;
  Learn: undefined;
};
