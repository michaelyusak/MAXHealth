import { Navigate, createBrowserRouter } from "react-router-dom";
import AuthenticationTemplate from "../templates/AuthenticationTemplate";
import RegisterPage from "../pages/RegisterUserPage";
import VerificationPage from "../pages/VerificationPage";
import RegisterDoctorPage from "../pages/RegisterDoctorPage";
import VerificationWaitingPage from "../pages/VerificationWaitingPage";
import LoginPage from "../pages/LoginPage";
import { path } from "./path";
import ResetPasswordRequestPage from "../pages/ResetPasswordRequestPage";
import ResetPasswordWaitingPage from "../pages/ResetPasswordWaitingPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import LandingPageTemplate from "../templates/LandingPageTemplate";
import LandingPage from "../pages/LandingPage";
import AddressProfilePage from "../pages/AddressProfilePage";
import ManagerDashboardPage from "../pages/ManagerDashboardPage";
import ManagerTemplate from "../templates/ManagerTemplate";
import ManagerDrugsPage from "../pages/ManagerDrugsPage";
import ManagerOrdersPage from "../pages/ManagerOrdersPage";
import ShopPage from "../pages/ShopPage";
import ProductDetail from "../pages/ProductDetail";
import CartPage from "../pages/CartPage";
import { AdminTemplate } from "../templates/AdminTemplate";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import ProfileTemplate from "../templates/ProfileTemplate";
import ProfilePage from "../pages/ProfilePage";
import ChatPage from "../pages/ChatPage";
import AdminPaymentProofPage from "../pages/AdminPaymentProofPage";
import CheckoutPage from "../pages/CheckoutPage";
import UserOrdersPage from "../pages/UserOrdersPage";
import UploadPaymentProofPage from "../pages/UploadPaymentProofPage";
import UserOrderPharmacyDetailPage from "../pages/UserOrderPharmacyDetailPage";
import AdminManageUserPage from "../pages/AdminManageUserPage";
import ProtectedRoute from "./ProtectedRoute";
import TelemedicineLandingUserPage from "../pages/TelemedicineLandingUserPage";
import DoctorTemplate from "../templates/DoctorTemplate";
import AdminOrdersPage from "../pages/AdminOrdersPage";
import ManagerPharmacy from "../pages/ManagerPharmacy";
import PrescriptionListPage from "../pages/PrescriptionListPage";
import CheckoutFromPrescriptionPage from "../pages/CheckoutFromPrescriptionPage";
import DoctorProfileTemplate from "../templates/DoctorProfileTemplate";
import DoctorProfilePage from "../pages/DoctorProfilePage";
import NotFoundPage from "../pages/NotFoundPage";
import ManagerReportPage from "../pages/ManagerReportPage";
import ManagerStockChangesPage from "../pages/ManagerStockChangesPage";
import AdminReportPage from "../pages/AdminReportPage";

const router = createBrowserRouter(
  [
    {
      path: "/auth",
      element: <AuthenticationTemplate></AuthenticationTemplate>,
      children: [
        {
          path: "/auth/",
          element: <Navigate to="/auth/register"></Navigate>,
        },
        {
          path: "/auth/login",
          element: <LoginPage></LoginPage>,
        },
        {
          path: "/auth/register",
          element: <RegisterPage></RegisterPage>,
        },
        {
          path: "/auth/verification/email/:encodedEmail",
          element: <VerificationWaitingPage></VerificationWaitingPage>,
        },
        {
          path: "/auth/verification/:token",
          element: <VerificationPage></VerificationPage>,
        },
        {
          path: "/auth/doctors/register",
          element: <RegisterDoctorPage></RegisterDoctorPage>,
        },
      ],
    },
    {
      path: "/reset-password",
      element: <AuthenticationTemplate />,
      children: [
        {
          path: path.resetPassword,
          element: <ResetPasswordRequestPage />,
        },
        {
          path: "/reset-password/:encodedEmail",
          element: <ResetPasswordWaitingPage />,
        },
        {
          path: "/reset-password/verification/:token",
          element: <ResetPasswordPage />,
        },
      ],
    },
    {
      path: "/",
      element: <LandingPageTemplate />,
      children: [
        {
          index: true,
          element: <LandingPage />,
        },
        {
          path: path.users,
          element: <ProtectedRoute acceptedRoles={["user"]}></ProtectedRoute>,
          children: [
            {
              path: path.users,
              element: <ProfileTemplate />,
              children: [
                {
                  path: path.users,
                  element: <Navigate to={path.profile} />,
                },
                {
                  path: path.profile,
                  element: <ProfilePage />,
                },
                {
                  path: path.address,
                  element: <AddressProfilePage />,
                },
              ],
            },
          ],
        },
        {
          path: "/prescriptions/",
          element: <ProtectedRoute acceptedRoles={["user"]}></ProtectedRoute>,
          children: [
            {
              path: "/prescriptions/",
              element: <PrescriptionListPage></PrescriptionListPage>,
            },
            {
              path: "/prescriptions/checkout/:prescription_id",
              element: (
                <CheckoutFromPrescriptionPage></CheckoutFromPrescriptionPage>
              ),
            },
          ],
        },
        {
          path: "/telemedicine/",
          children: [
            {
              path: "/telemedicine/",
              element: (
                <TelemedicineLandingUserPage></TelemedicineLandingUserPage>
              ),
            },
            {
              path: "/telemedicine/chats/",
              element: (
                <ProtectedRoute
                  acceptedRoles={["user"]}
                  roleBasedOnFailRedirectTo={{
                    ["user"]: { to: "/telemedicine/" },
                  }}
                ></ProtectedRoute>
              ),
              children: [
                {
                  path: "/telemedicine/chats/",
                  element: <ChatPage></ChatPage>,
                },
              ],
            },
          ],
        },
        {
          path: "/product",
          children: [
            {
              index: true,
              element: <ShopPage />,
            },
            {
              path: ":id",
              element: <ProductDetail />,
            },
          ],
        },
        {
          path: "/cart/",
          element: <ProtectedRoute acceptedRoles={["user"]}></ProtectedRoute>,
          children: [
            {
              path: "/cart/",
              element: <CartPage />,
            },
          ],
        },
        {
          path: path.checkout,
          element: <CheckoutPage />,
        },
        {
          path: "/orders/",
          children: [
            {
              path: "/orders/",
              element: <UserOrdersPage />,
            },
            {
              path: "/orders/:id/",
              element: <UserOrderPharmacyDetailPage />,
            },
            {
              path: "/orders/payment/:orderId",
              element: <UploadPaymentProofPage />,
            },
          ],
        },
      ],
    },
    {
      path: "/manager/",
      element: (
        <ProtectedRoute acceptedRoles={["pharmacy manager"]}></ProtectedRoute>
      ),
      children: [
        {
          path: "/manager/",
          element: <ManagerTemplate></ManagerTemplate>,
          children: [
            {
              path: "/manager/",
              element: <Navigate to="/manager/dashboard"></Navigate>,
            },
            {
              path: "/manager/dashboard",
              element: <ManagerDashboardPage></ManagerDashboardPage>,
            },
            {
              path: "/manager/drugs",
              element: <ManagerDrugsPage></ManagerDrugsPage>,
            },
            {
              path: "/manager/orders",
              element: <ManagerOrdersPage></ManagerOrdersPage>,
            },
            {
              path: "/manager/pharmacy",
              element: <ManagerPharmacy></ManagerPharmacy>,
            },
            {
              path: "/manager/reports",
              element: <ManagerReportPage />,
            },
            {
              path: "/manager/stock-changes",
              element: <ManagerStockChangesPage></ManagerStockChangesPage>,
            },
          ],
        },
      ],
    },
    {
      path: "/admin",
      element: <ProtectedRoute acceptedRoles={["admin"]}></ProtectedRoute>,
      children: [
        {
          path: "/admin",
          element: <AdminTemplate></AdminTemplate>,
          children: [
            {
              path: "/admin/",
              element: <Navigate to={"/admin/dashboard"}></Navigate>,
            },
            {
              path: "/admin/dashboard",
              element: <AdminDashboardPage></AdminDashboardPage>,
            },
            {
              path: "/admin/payment",
              element: <AdminPaymentProofPage></AdminPaymentProofPage>,
            },
            {
              path: "/admin/orders",
              element: <AdminOrdersPage />,
            },
            {
              path: "/admin/manage-user",
              element: <AdminManageUserPage></AdminManageUserPage>,
            },
            {
              path: "/admin/reports",
              element: <AdminReportPage />,
            },
          ],
        },
      ],
    },
    {
      path: "/doctors/",
      element: <ProtectedRoute acceptedRoles={["doctor"]}></ProtectedRoute>,
      children: [
        {
          path: "/doctors/",
          element: <DoctorTemplate></DoctorTemplate>,
          children: [
            {
              path: "/doctors/",
              element: <Navigate to={"/doctors/profile/"}></Navigate>,
            },
            {
              path: "/doctors/telemedicine",
              element: <Navigate to="/doctors/telemedicine/chats/"></Navigate>,
            },
            {
              path: "/doctors/telemedicine/chats",
              element: <ChatPage></ChatPage>,
            },
            {
              path: "/doctors/profile/",
              element: <DoctorProfileTemplate></DoctorProfileTemplate>,
              children: [
                {
                  path: "/doctors/profile/",
                  element: <DoctorProfilePage></DoctorProfilePage>,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <NotFoundPage></NotFoundPage>,
    },
  ],
  {
    basename: "/",
  }
);

export default router;
