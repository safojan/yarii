export enum AdminRoutes {
  Dashboard = 'dashboard',

  //added by safdar jan
  Projects = 'projects',

  Events = 'events',
  Settings = 'settings',
  Elements = 'elements',
}

export enum ElementRoutes {
  Alert = 'alert',
  Modal = 'modal',
  Buttons = 'buttons',
  Tabs = 'tabs',
  DataTable = 'data-table',
  Forms = 'forms',
}

export enum SettingRoutes {
  Profile = 'profile',
  Users = 'users',
}

//added by safdar jan
export enum ProjectRoutes {
  Add = 'add',
  AddType = 'add-types',
  Edit = 'edit/:id',
  View = 'view/:id',
}
