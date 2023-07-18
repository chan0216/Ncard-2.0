import pandas
from decouple import config


class DataService:

    def __init__(self):
        self.universities_data = pandas.read_csv(config('CSV_PATH'))

    def get_universities(self, page):
        try:
            page = int(page)
        except:
            return None, None
        render_num = 10
        render_index = page * render_num

        df = self.universities_data[2:]
        school_name = df['Unnamed: 4']
        school_name_list = school_name.iloc[render_index:render_index +
                                            render_num + 1].to_list()
        if len(school_name_list) > render_num:
            next_page = page + 1
            school_name_list = school_name_list[:render_num]
        else:
            next_page = None
        return school_name_list, next_page
