"""add repeat fields to event

Revision ID: 4681d8d13e89
Revises: 840607e8fdcb
Create Date: 2025-05-08 17:06:29.070804

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '4681d8d13e89'
down_revision: Union[str, None] = '840607e8fdcb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создаем enum тип для repeat_type
    repeat_type = postgresql.ENUM('none', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', name='repeattype')
    repeat_type.create(op.get_bind())

    # Добавляем колонки
    op.add_column('event', sa.Column('repeat_type', sa.Enum('none', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', name='repeattype'), nullable=False, server_default='none'))
    op.add_column('event', sa.Column('repeat_until', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Удаляем колонки
    op.drop_column('event', 'repeat_until')
    op.drop_column('event', 'repeat_type')
    
    # Удаляем enum тип
    repeat_type = postgresql.ENUM('none', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', name='repeattype')
    repeat_type.drop(op.get_bind())
