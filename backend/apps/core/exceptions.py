from rest_framework.exceptions import APIException


class BusinessRuleException(APIException):
    """Custom exception for business rule violations."""

    status_code = 400
    default_detail = 'Business rule violated.'
    default_code = 'business_rule_violation'
