"""update models for new features

Revision ID: 004_update_models
Revises: 003_create_github_repos_table
Create Date: 2024-01-14

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    # Update resumes table
    op.add_column('resumes', sa.Column('parsed_sections', sa.JSON(), nullable=True))
    op.add_column('resumes', sa.Column('word_count', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('resumes', sa.Column('page_count', sa.Integer(), nullable=True, server_default='0'))

    # Update adaptations table
    op.add_column('adaptations', sa.Column('job_company', sa.String(), nullable=True))
    op.add_column('adaptations', sa.Column('job_location', sa.String(), nullable=True))
    op.add_column('adaptations', sa.Column('job_requirements', sa.JSON(), nullable=True))
    op.add_column('adaptations', sa.Column('keywords_missing', sa.JSON(), nullable=True))
    op.add_column('adaptations', sa.Column('changes_made', sa.JSON(), nullable=True))
    op.add_column('adaptations', sa.Column('recommendations', sa.JSON(), nullable=True))
    op.add_column('adaptations', sa.Column('github_projects_included', sa.JSON(), nullable=True))

    # Update github_repos table
    op.add_column('github_repos', sa.Column('forks', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('github_repos', sa.Column('is_private', sa.Boolean(), nullable=True, server_default='false'))


def downgrade():
    # Rollback github_repos changes
    op.drop_column('github_repos', 'is_private')
    op.drop_column('github_repos', 'forks')

    # Rollback adaptations changes
    op.drop_column('adaptations', 'github_projects_included')
    op.drop_column('adaptations', 'recommendations')
    op.drop_column('adaptations', 'changes_made')
    op.drop_column('adaptations', 'keywords_missing')
    op.drop_column('adaptations', 'job_requirements')
    op.drop_column('adaptations', 'job_location')
    op.drop_column('adaptations', 'job_company')

    # Rollback resumes changes
    op.drop_column('resumes', 'page_count')
    op.drop_column('resumes', 'word_count')
    op.drop_column('resumes', 'parsed_sections')
