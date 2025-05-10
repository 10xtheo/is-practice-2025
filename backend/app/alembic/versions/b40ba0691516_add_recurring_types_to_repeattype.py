"""add_recurring_types_to_repeattype

Revision ID: b40ba0691516
Revises: 409f43a89636
Create Date: 2025-05-10 15:59:01.891036

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b40ba0691516'
down_revision: Union[str, None] = '409f43a89636'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create new enum type with additional values
    op.execute("ALTER TYPE repeattype ADD VALUE IF NOT EXISTS 'recurring_parent'")
    op.execute("ALTER TYPE repeattype ADD VALUE IF NOT EXISTS 'recurring_duplicate'")


def downgrade() -> None:
    # Note: PostgreSQL does not support removing values from enum types
    # The best we can do is create a new type without these values
    # and replace the old type, but this would require migrating all data
    # For now, we'll leave the values in place
    pass 