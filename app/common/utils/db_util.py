from common.configs.db_config import db


def add_value(model, **kwargs):
    try:
        instance = model(**kwargs)
        db.session.add(instance)
        db.session.commit()
        return instance

    except Exception as e:
        db.session.rollback()
        raise e


def delete_value(instance):
    try:
        db.session.delete(instance)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        raise e


def update_value(instance, **kwargs):
    try:
        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise e


def query_all(model, *args, **kwargs):
    try:
        return model.query.filter(*args, **kwargs).all()
    except Exception as e:
        error_message = f"Error when querying {model.__name__}: {e}"
        return {"error": True, "message": error_message}


def query_one(model, *args, **kwargs):
    try:
        return model.query.filter(*args, **kwargs).first()
    except Exception as e:
        error_message = f"Error when querying {model.__name__}: {e}"
        return {"error": True, "message": error_message}