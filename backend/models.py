from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    pseudo = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="student")  # student | admin
    level = Column(String, nullable=True)
    is_online = Column(Boolean, default=False)
    network_type = Column(String, default="internet")  # intranet | internet
    created_at = Column(DateTime, default=datetime.utcnow)

    sent_messages = relationship(
        "PrivateMessage",
        foreign_keys="PrivateMessage.sender_id",
        back_populates="sender",
    )
    received_messages = relationship(
        "PrivateMessage",
        foreign_keys="PrivateMessage.receiver_id",
        back_populates="receiver",
    )


class PrivateMessage(Base):
    __tablename__ = "private_messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String, default="sent")  # sent | pending
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship(
        "User", foreign_keys=[sender_id], back_populates="sent_messages"
    )
    receiver = relationship(
        "User", foreign_keys=[receiver_id], back_populates="received_messages"
    )


class Zone(Base):
    __tablename__ = "zones"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, default="classic")  # admin | student | classic
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("ZoneMember", back_populates="zone", cascade="all, delete-orphan")
    messages = relationship("ZoneMessage", back_populates="zone", cascade="all, delete-orphan")


class ZoneMember(Base):
    __tablename__ = "zone_members"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone", back_populates="members")
    user = relationship("User")


class ZoneMessage(Base):
    __tablename__ = "zone_messages"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone", back_populates="messages")
    sender = relationship("User")


class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=False)
    level = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(String, default="campus")  # schedule | campus
    date = Column(DateTime, nullable=False)
    class_name = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
