"""removed message from notification table

Revision ID: c5ab8088a896
Revises: 2a9459cf6aec
Create Date: 2025-04-25 13:07:06.474472

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'c5ab8088a896'
down_revision = '2a9459cf6aec'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('notification', 'message')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('notification', sa.Column('message', sa.VARCHAR(), autoincrement=False, nullable=False))
    # ### end Alembic commands ###
