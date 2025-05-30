"""add category_id to event

Revision ID: 9e4fd8a69826
Revises: c5ab8088a896
Create Date: 2025-04-25 17:34:47.843184

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '9e4fd8a69826'
down_revision = 'c5ab8088a896'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('event', sa.Column('category_id', sa.Uuid(), nullable=False))
    op.create_foreign_key(None, 'event', 'category', ['category_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'event', type_='foreignkey')
    op.drop_column('event', 'category_id')
    # ### end Alembic commands ###
