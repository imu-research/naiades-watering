from allauth.socialaccount import providers
from allauth.socialaccount.providers.base import ProviderAccount
from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider


class KeyRockAccount(ProviderAccount):
    pass


class KeyRockProvider(OAuth2Provider):
    id = 'keyrockprovider'
    name = 'KeyRock OAuth2 Provider'
    account_class = KeyRockAccount

    def extract_uid(self, data):
        return str(data['id'])

    def extract_common_fields(self, data):
        return dict(username=data['username'],
                    email=data['email'],
                    first_name=data['first_name'],
                    last_name=data['last_name'],)

    def get_default_scope(self):
        scope = ['read']
        return scope


providers.registry.register(KeyRockProvider)
