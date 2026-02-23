export type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
  Editor: {projectId: string};
  Preview: {projectId: string};
  Export: {projectId?: string};
  ProjectDetails: {projectId: string};
};

export type MainTabsParamList = {
  Projects: undefined;
  Create: undefined;
  ExportHub: undefined;
  Learn: undefined;
};
