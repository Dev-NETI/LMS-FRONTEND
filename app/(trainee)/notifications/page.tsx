import AuthGuard from "@/src/components/auth/AuthGuard";
import Layout from "@/src/components/layout/Layout";
import Notifications from "@/src/components/trainee/Notifications";

function Notification() {
  return (
    <AuthGuard>
      <Layout>
        <Notifications />
      </Layout>
    </AuthGuard>
  );
}

export default Notification;
