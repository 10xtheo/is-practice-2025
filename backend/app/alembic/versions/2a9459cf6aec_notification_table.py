"""notification table

Revision ID: 2a9459cf6aec
Revises: e8500d2d8458
Create Date: 2025-04-25 12:19:43.864236

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '2a9459cf6aec'
down_revision = 'e8500d2d8458'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('notification',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('event_id', sa.Uuid(), nullable=False),
    sa.Column('message', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('send_at', sa.DateTime(), nullable=False),
    sa.Column('sent', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('notification')
    # ### end Alembic commands ###
