def row_to_dict(row):
    result_dict = {}
    for column in row.__table__.columns:
        result_dict[column.name] = str(getattr(row, column.name))
    return result_dict


def selected_columns_to_dict(row):
    return row._asdict()


def get_paginated_data(page, query_function, user_id=None):
    try:
        page = int(page)
    except:
        return None, None

    render_num = 10
    render_index = page * render_num

    if user_id is not None:
        posts = query_function(user_id, render_index, render_num + 1)
    else:
        posts = query_function(render_index, render_num + 1)

    if len(posts) > render_num:
        next_page = page + 1
        posts = posts[:render_num]
    else:
        next_page = None

    return [selected_columns_to_dict(post) for post in posts], next_page