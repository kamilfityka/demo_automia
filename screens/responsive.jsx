/* ============================================================
   Responsive screen wrappers
   Each canonical screen picks the desktop or mobile layout
   at render time based on the viewport (useIsDesktop).
   The mobile (*M) and desktop (*D) implementations live in
   screens/mobile and screens/desktop respectively.
   ============================================================ */

function LoginScreen(props) {
  return useIsDesktop() ? <LoginScreenD {...props} /> : <LoginScreenM {...props} />;
}
function DashboardScreen(props) {
  return useIsDesktop() ? <DashboardScreenD {...props} /> : <DashboardScreenM {...props} />;
}
function FormsScreen(props) {
  return useIsDesktop() ? <FormsScreenD {...props} /> : <FormsScreenM {...props} />;
}
function FormBuilderScreen(props) {
  return useIsDesktop() ? <FormBuilderScreenD {...props} /> : <FormBuilderScreenM {...props} />;
}
function LeadDetailScreen(props) {
  return useIsDesktop() ? <LeadDetailScreenD {...props} /> : <LeadDetailScreenM {...props} />;
}
function LeadsScreen(props) {
  return useIsDesktop() ? <LeadsScreenD {...props} /> : <LeadsScreenM {...props} />;
}
function PublicFormScreen(props) {
  return useIsDesktop() ? <PublicFormScreenD {...props} /> : <PublicFormScreenM {...props} />;
}
function UsersScreen(props) {
  return useIsDesktop() ? <UsersScreenD {...props} /> : <UsersScreenM {...props} />;
}
function AccountScreen(props) {
  return useIsDesktop() ? <AccountScreenD {...props} /> : <AccountScreenM {...props} />;
}

Object.assign(window, {
  LoginScreen, DashboardScreen, FormsScreen, FormBuilderScreen,
  LeadDetailScreen, LeadsScreen, PublicFormScreen, UsersScreen, AccountScreen,
});
