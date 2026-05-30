from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status


User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='john', password='Pass1234!', email='john@example.com', role='ADMIN'
        )
        self.company = None

    def test_me_includes_role(self):
        login_resp = self.client.post(
            '/api/auth/login/', {'username': 'john', 'password': 'Pass1234!'}, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_resp.data['access']}")
        me_resp = self.client.get('/api/auth/me/')

        self.assertEqual(me_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(me_resp.data['username'], 'john')
        self.assertEqual(me_resp.data['role'], 'ADMIN')

    def test_jwt_login_refresh_and_me(self):
        login_resp = self.client.post(
            '/api/auth/login/', {'username': 'john', 'password': 'Pass1234!'}, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_resp.data)
        self.assertIn('refresh', login_resp.data)

        refresh_resp = self.client.post(
            '/api/auth/refresh/', {'refresh': login_resp.data['refresh']}, format='json')
        self.assertEqual(refresh_resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_resp.data)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_resp.data['access']}")
        me_resp = self.client.get('/api/auth/me/')
        self.assertEqual(me_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(me_resp.data['username'], 'john')

    def test_login_rejects_bad_password(self):
        resp = self.client.post(
            '/api/auth/login/', {'username': 'john', 'password': 'wrong'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
