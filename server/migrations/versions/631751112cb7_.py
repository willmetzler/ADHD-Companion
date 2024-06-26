"""empty message

Revision ID: 631751112cb7
Revises: 
Create Date: 2024-06-14 13:29:40.047292

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '631751112cb7'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users_table',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('first_name', sa.String(), nullable=False),
    sa.Column('last_name', sa.String(), nullable=False),
    sa.Column('_hashed_password', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('username')
    )
    op.create_table('journal_table',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('journal_header', sa.String(), nullable=True),
    sa.Column('journal_text', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users_table.id'], name=op.f('fk_journal_table_user_id_users_table')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('medications_table',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('drug_name', sa.String(), nullable=False),
    sa.Column('dosage', sa.Integer(), nullable=False),
    sa.Column('prescriber', sa.String(), nullable=False),
    sa.Column('renew_date', sa.DateTime(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users_table.id'], name=op.f('fk_medications_table_user_id_users_table')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('mood_table',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('mood_rating', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('journal_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['journal_id'], ['journal_table.id'], name=op.f('fk_mood_table_journal_id_journal_table')),
    sa.ForeignKeyConstraint(['user_id'], ['users_table.id'], name=op.f('fk_mood_table_user_id_users_table')),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('mood_table')
    op.drop_table('medications_table')
    op.drop_table('journal_table')
    op.drop_table('users_table')
    # ### end Alembic commands ###
