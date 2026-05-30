from django.contrib.auth import get_user_model

User = get_user_model()
username = 'testuser'
password = 'Testpass123!'
email = 'testuser@example.com'
if not User.objects.filter(username=username).exists():
    User.objects.create_user(
        username=username, password=password, email=email, role='ADMIN')
    print('created')
else:
    print('exists')
