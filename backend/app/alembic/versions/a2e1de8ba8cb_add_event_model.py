"""Add Event model

Revision ID: a2e1de8ba8cb
Revises: 980680f71e77
Create Date: 2025-04-19 16:33:52.946090

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'a2e1de8ba8cb'
down_revision = '980680f71e77'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('event',
    sa.Column('title', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=True),
    sa.Column('start', sa.DateTime(), nullable=False),
    sa.Column('end', sa.DateTime(), nullable=False),
    sa.Column('type', sa.Enum('MEETING', 'TASK', 'REMINDER', 'HOLIDAY', name='eventtype'), nullable=False),
    sa.Column('repeat_step', sa.Integer(), nullable=False),
    sa.Column('is_private', sa.Boolean(), nullable=False),
    sa.Column('priority', sa.Enum('LOW', 'MEDIUM', 'HIGH', name='eventpriority'), nullable=False),
    sa.Column('is_finished', sa.Boolean(), nullable=False),
    sa.Column('max_repeats_count', sa.Integer(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('creator_id', sa.Uuid(), nullable=False),
    sa.ForeignKeyConstraint(['creator_id'], ['user.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('event')
    # ### end Alembic commands ###
