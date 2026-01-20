"""add language and github project selection fields

Revision ID: 005_add_language_github
Revises: 004
Create Date: 2025-01-17

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    # Add language and project selection fields to adaptations table
    op.add_column('adaptations', sa.Column('language', sa.String(), nullable=True))
    op.add_column('adaptations', sa.Column('language_reason', sa.String(), nullable=True))
    op.add_column('adaptations', sa.Column('selected_github_projects', sa.JSON(), nullable=True))


def downgrade():
    # Rollback changes
    op.drop_column('adaptations', 'selected_github_projects')
    op.drop_column('adaptations', 'language_reason')
    op.drop_column('adaptations', 'language')
