from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=255)
    company = models.ForeignKey(
        'companies.Company', on_delete=models.CASCADE, related_name='departments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['name', 'company'])]
        unique_together = ('name', 'company')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.company})"
