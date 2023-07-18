from flask import Blueprint, request
from services.data_service import DataService

data_controller = Blueprint("data_controller", __name__)
data_service = DataService()


@data_controller.route("/universities", methods=["GET"])
def get_universities():
    page = request.args.get('page')
    school_names_list, next_page = data_service.get_universities(page)
    return {"data": school_names_list, "nextPage": next_page}
