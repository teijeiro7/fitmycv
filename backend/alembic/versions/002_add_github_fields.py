"""add github fields

Revision ID: 002
Revises: 001
Create Date: 2026-01-11

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Add github fields to users table
    op.add_column('users', sa.Column('github_access_token', sa.String(), nullable=True))
    op.add_column('users', sa.Column('github_username', sa.String(), nullable=True))


def downgrade():
    # Remove github fields from users table
    op.drop_column('users', 'github_username')
    op.drop_column('users', 'github_access_token')
