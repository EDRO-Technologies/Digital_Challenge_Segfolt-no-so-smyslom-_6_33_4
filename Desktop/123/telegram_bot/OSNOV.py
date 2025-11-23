import telebot
from telebot import types
import pandas as pd
import json
import os
import calendar
from datetime import datetime, timedelta
import re
import shutil

# Инициализация бота
bot = telebot.TeleBot('8384765658:AAGKlmU0cEn0Jp3TNt2MU_-UXMW8eI3fUfQ')

# Файлы для хранения данных
USERS_FILE = 'users.json'
SCHEDULE_DATA_FILE = 'schedule_data.json'
UPLOAD_FOLDER = 'uploaded_files'

# Создаем папку для загруженных файлов
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Словарь с файлами расписания
EXCEL_FILES = {
    'ИВТ': 'ИВТ.xlsx',
    'ИСиТ': 'ИСиТ.xlsx',
    'ИТиСС': 'ИТиСС.xlsx',
    'Магистратура_Электроэнергетика': 'Магистрартура_Электроэнергетика.xlsx',
    'Магистратура_Программная_инженерия': 'Магистратура Программная инженерия.xlsx',
    'Магистратура_УТС': 'Магистратура УТС.xlsx'
}

# Состояния пользователей
user_states = {}


# Загрузка пользователей
def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


# Сохранение пользователей
def save_users(users):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2)


# Загрузка данных расписания
def load_schedule_data():
    if os.path.exists(SCHEDULE_DATA_FILE):
        with open(SCHEDULE_DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


# Сохранение данных расписания
def save_schedule_data(data):
    with open(SCHEDULE_DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def is_user_logged_in(user_id):
    """Проверяет, вошел ли пользователь в систему"""
    users = load_users()
    return user_id in users and users[user_id].get('logged_in', False)


def require_login(func):
    """Декоратор для проверки авторизации"""

    def wrapper(message):
        user_id = str(message.from_user.id)
        if not is_user_logged_in(user_id):
            show_login_menu(message)
            return
        return func(message)

    return wrapper


def show_login_menu(message):
    """Показывает меню входа/регистрации"""
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    markup.add(types.KeyboardButton("🔐 Войти в систему"))
    markup.add(types.KeyboardButton("📝 Зарегистрироваться"))

    bot.send_message(message.chat.id,
                     "🔐 Для доступа к функциям бота необходимо авторизоваться\n"
                     "Выберите действие:",
                     reply_markup=markup)


def show_main_menu(message):
    """Показывает главное меню после входа"""
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    markup.add(types.KeyboardButton("📅 Расписание на неделю"))
    markup.add(types.KeyboardButton("📆 Интерактивный календарь"))
    markup.add(types.KeyboardButton("📁 Загрузить новый файл"))
    markup.add(types.KeyboardButton("🔄 Сменить группу"))
    markup.add(types.KeyboardButton("📊 Статистика"))
    markup.add(types.KeyboardButton("ℹ️ Мои данные"))
    markup.add(types.KeyboardButton("🚪 Выйти из системы"))

    bot.send_message(message.chat.id, "Главное меню:", reply_markup=markup)


# Команда старт
@bot.message_handler(commands=['start'])
def start_command(message):
    user_id = str(message.from_user.id)
    users = load_users()

    if user_id in users and users[user_id].get('logged_in', False):
        show_main_menu(message)
    else:
        show_login_menu(message)


# Обработка кнопки регистрации
@bot.message_handler(func=lambda message: message.text == "📝 Зарегистрироваться")
def register_command(message):
    bot.send_message(message.chat.id,
                     "👋 Добро пожаловать в систему регистрации!\n"
                     "Введите логин для регистрации:",
                     reply_markup=types.ReplyKeyboardRemove())
    bot.register_next_step_handler(message, process_register_login)


def process_register_login(message):
    login = message.text.strip()
    if len(login) < 3:
        bot.send_message(message.chat.id,
                         "❌ Логин должен содержать минимум 3 символа. Введите логин еще раз:")
        bot.register_next_step_handler(message, process_register_login)
        return

    user_states[message.from_user.id] = {'login': login, 'action': 'register'}
    bot.send_message(message.chat.id, "Введите пароль:")
    bot.register_next_step_handler(message, process_register_password)


def process_register_password(message):
    user_id = str(message.from_user.id)
    password = message.text.strip()

    if len(password) < 4:
        bot.send_message(message.chat.id,
                         "❌ Пароль должен содержать минимум 4 символа. Введите пароль еще раз:")
        bot.register_next_step_handler(message, process_register_password)
        return

    user_data = user_states.get(message.from_user.id, {})
    login = user_data.get('login')

    if not login:
        bot.send_message(message.chat.id, "❌ Ошибка регистрации. Начните заново с /start")
        return

    # Выбор направления
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    markup.add(types.KeyboardButton("📁 Загрузить свой файл"))
    for direction in EXCEL_FILES.keys():
        markup.add(types.KeyboardButton(direction))

    bot.send_message(message.chat.id,
                     "Выберите ваше направление или загрузите свой файл:",
                     reply_markup=markup)

    user_states[message.from_user.id] = {
        'login': login,
        'password': password,
        'action': 'register_direction'
    }
    bot.register_next_step_handler(message, process_register_direction)


def process_register_direction(message):
    direction = message.text.strip()
    user_data = user_states.get(message.from_user.id, {})

    if direction == "📁 Загрузить свой файл":
        bot.send_message(message.chat.id,
                         "📎 Пожалуйста, загрузите ваш Excel файл с расписанием:",
                         reply_markup=types.ReplyKeyboardRemove())
        user_states[message.from_user.id]['action'] = 'register_file_upload'
        bot.register_next_step_handler(message, process_register_file_upload)
        return

    if direction not in EXCEL_FILES:
        bot.send_message(message.chat.id,
                         "❌ Пожалуйста, выберите направление из предложенных вариантов:")
        bot.register_next_step_handler(message, process_register_direction)
        return

    # Выбор курса
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    if 'Магистратура' in direction:
        courses = ["1 курс", "2 курс"]
    else:
        courses = ["1 курс", "2 курс", "3 курс", "4 курс"]

    for course in courses:
        markup.add(types.KeyboardButton(course))

    bot.send_message(message.chat.id, "Выберите ваш курс:", reply_markup=markup)

    user_states[message.from_user.id]['direction'] = direction
    user_states[message.from_user.id]['action'] = 'register_course'
    bot.register_next_step_handler(message, process_register_course)


def process_register_file_upload(message):
    if not message.document:
        bot.send_message(message.chat.id,
                         "❌ Пожалуйста, загрузите файл в формате Excel (.xlsx):")
        bot.register_next_step_handler(message, process_register_file_upload)
        return

    user_data = user_states.get(message.from_user.id, {})

    # Скачиваем файл
    file_info = bot.get_file(message.document.file_id)
    downloaded_file = bot.download_file(file_info.file_path)

    # Сохраняем файл
    file_extension = message.document.file_name.split('.')[-1]
    if file_extension not in ['xlsx', 'xls']:
        bot.send_message(message.chat.id, "❌ Пожалуйста, загрузите файл в формате Excel (.xlsx или .xls)")
        return

    file_path = os.path.join(UPLOAD_FOLDER, f"{user_data['login']}_{message.document.file_name}")
    with open(file_path, 'wb') as new_file:
        new_file.write(downloaded_file)

    # Выбор курса для загруженного файла
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    courses = ["1 курс", "2 курс", "3 курс", "4 курс"]
    for course in courses:
        markup.add(types.KeyboardButton(course))

    bot.send_message(message.chat.id,
                     f"✅ Файл успешно загружен!\nТеперь выберите курс:",
                     reply_markup=markup)

    user_states[message.from_user.id]['custom_file'] = file_path
    user_states[message.from_user.id]['action'] = 'register_course_custom'
    bot.register_next_step_handler(message, process_register_course_custom)


def process_register_course_custom(message):
    course = message.text.strip()
    valid_courses = ["1 курс", "2 курс", "3 курс", "4 курс"]

    if course not in valid_courses:
        bot.send_message(message.chat.id,
                         "❌ Пожалуйста, выберите курс из предложенных вариантов:")
        bot.register_next_step_handler(message, process_register_course_custom)
        return

    # Сохраняем пользователя с кастомным файлом
    user_data = user_states.get(message.from_user.id, {})
    user_id = str(message.from_user.id)

    users = load_users()

    # Если пользователь уже существует, обновляем его данные
    if user_id in users:
        bot.send_message(message.chat.id, "ℹ️ Ваш аккаунт был обновлен!")

    users[user_id] = {
        'login': user_data['login'],
        'password': user_data['password'],
        'direction': 'custom',
        'course': course,
        'custom_file': user_data.get('custom_file'),
        'registered_at': datetime.now().isoformat(),
        'logged_in': True
    }
    save_users(users)

    # Очищаем состояние
    if message.from_user.id in user_states:
        del user_states[message.from_user.id]

    bot.send_message(message.chat.id,
                     f"✅ Регистрация завершена!\n"
                     f"🆔 Логин: {user_data['login']}\n"
                     f"🎓 Направление: Загруженный файл\n"
                     f"📚 Курс: {course}\n\n"
                     f"🔓 Вы автоматически вошли в систему!",
                     reply_markup=types.ReplyKeyboardRemove())

    show_main_menu(message)


def process_register_course(message):
    course = message.text.strip()
    valid_courses = ["1 курс", "2 курс", "3 курс", "4 курс"]

    user_data = user_states.get(message.from_user.id, {})
    direction = user_data.get('direction')

    if 'Магистратура' in direction:
        valid_courses = ["1 курс", "2 курс"]

    if course not in valid_courses:
        bot.send_message(message.chat.id,
                         "❌ Пожалуйста, выберите курс из предложенных вариантов:")
        bot.register_next_step_handler(message, process_register_course)
        return

    # Сохраняем пользователя
    user_id = str(message.from_user.id)
    users = load_users()

    # Если пользователь уже существует, обновляем его данные
    if user_id in users:
        bot.send_message(message.chat.id, "ℹ️ Ваш аккаунт был обновлен!")

    users[user_id] = {
        'login': user_data['login'],
        'password': user_data['password'],
        'direction': direction,
        'course': course,
        'registered_at': datetime.now().isoformat(),
        'logged_in': True
    }
    save_users(users)

    # Очищаем состояние
    if message.from_user.id in user_states:
        del user_states[message.from_user.id]

    bot.send_message(message.chat.id,
                     f"✅ Регистрация завершена!\n"
                     f"🆔 Логин: {user_data['login']}\n"
                     f"🎓 Направление: {direction}\n"
                     f"📚 Курс: {course}\n\n"
                     f"🔓 Вы автоматически вошли в систему!",
                     reply_markup=types.ReplyKeyboardRemove())

    show_main_menu(message)


# Обработка кнопки входа
@bot.message_handler(func=lambda message: message.text == "🔐 Войти в систему")
def login_command(message):
    user_id = str(message.from_user.id)
    users = load_users()

    if user_id in users and users[user_id].get('logged_in', False):
        bot.send_message(message.chat.id, "✅ Вы уже вошли в систему!")
        show_main_menu(message)
        return

    bot.send_message(message.chat.id,
                     "🔐 Вход в систему\n"
                     "Введите ваш логин:",
                     reply_markup=types.ReplyKeyboardRemove())
    bot.register_next_step_handler(message, process_login_username)


def process_login_username(message):
    login = message.text.strip()
    users = load_users()

    # Ищем пользователя по логину
    user_id = None
    for uid, user_data in users.items():
        if user_data.get('login') == login:
            user_id = uid
            break

    if not user_id:
        bot.send_message(message.chat.id,
                         "❌ Пользователь с таким логином не найден.\n"
                         "Попробуйте еще раз или зарегистрируйтесь:",
                         reply_markup=types.ReplyKeyboardRemove())
        show_login_menu(message)
        return

    user_states[message.from_user.id] = {
        'user_id': user_id,
        'login': login,
        'action': 'login_password'
    }

    bot.send_message(message.chat.id, "Введите пароль:")
    bot.register_next_step_handler(message, process_login_password)


def process_login_password(message):
    password = message.text.strip()
    user_data = user_states.get(message.from_user.id, {})
    user_id = user_data.get('user_id')

    if not user_id:
        bot.send_message(message.chat.id, "❌ Ошибка входа. Начните заново.")
        show_login_menu(message)
        return

    users = load_users()
    if users[user_id].get('password') == password:
        # Успешный вход
        users[user_id]['logged_in'] = True
        users[user_id]['last_login'] = datetime.now().isoformat()
        save_users(users)

        # Очищаем состояние
        if message.from_user.id in user_states:
            del user_states[message.from_user.id]

        bot.send_message(message.chat.id,
                         f"✅ Вход выполнен успешно!\n"
                         f"👋 Добро пожаловать, {users[user_id]['login']}!",
                         reply_markup=types.ReplyKeyboardRemove())
        show_main_menu(message)
    else:
        bot.send_message(message.chat.id,
                         "❌ Неверный пароль. Попробуйте еще раз:",
                         reply_markup=types.ReplyKeyboardRemove())
        show_login_menu(message)


# Обработка выхода из системы
@bot.message_handler(func=lambda message: message.text == "🚪 Выйти из системы")
@require_login
def logout_command(message):
    user_id = str(message.from_user.id)
    users = load_users()

    if user_id in users:
        users[user_id]['logged_in'] = False
        save_users(users)

    bot.send_message(message.chat.id,
                     "✅ Вы вышли из системы.\n"
                     "Для доступа к функциям войдите снова.",
                     reply_markup=types.ReplyKeyboardRemove())
    show_login_menu(message)


# Обработка смены группы
@bot.message_handler(func=lambda message: message.text == "🔄 Сменить группу")
@require_login
def change_group_command(message):
    user_id = str(message.from_user.id)
    users = load_users()

    if user_id not in users:
        bot.send_message(message.chat.id, "❌ Сначала зарегистрируйтесь с помощью /start")
        return

    # Сохраняем текущие данные пользователя для возможного использования
    current_user_data = users[user_id].copy()

    # Начинаем процесс смены группы (по сути, повторная регистрация)
    bot.send_message(message.chat.id,
                     "🔄 Смена группы/направления\n"
                     "Введите новый логин (или старый, если хотите оставить прежним):",
                     reply_markup=types.ReplyKeyboardRemove())

    user_states[message.from_user.id] = {
        'current_data': current_user_data,
        'action': 'change_group_login'
    }
    bot.register_next_step_handler(message, process_change_group_login)


def process_change_group_login(message):
    login = message.text.strip()
    if len(login) < 3:
        bot.send_message(message.chat.id,
                         "❌ Логин должен содержать минимум 3 символа. Введите логин еще раз:")
        bot.register_next_step_handler(message, process_change_group_login)
        return

    user_states[message.from_user.id]['login'] = login
    user_states[message.from_user.id]['action'] = 'change_group_password'

    bot.send_message(message.chat.id, "Введите новый пароль (или старый, если хотите оставить прежним):")
    bot.register_next_step_handler(message, process_change_group_password)


def process_change_group_password(message):
    password = message.text.strip()

    if len(password) < 4:
        bot.send_message(message.chat.id,
                         "❌ Пароль должен содержать минимум 4 символа. Введите пароль еще раз:")
        bot.register_next_step_handler(message, process_change_group_password)
        return

    user_states[message.from_user.id]['password'] = password

    # Выбор направления
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    markup.add(types.KeyboardButton("📁 Загрузить свой файл"))
    for direction in EXCEL_FILES.keys():
        markup.add(types.KeyboardButton(direction))

    bot.send_message(message.chat.id,
                     "Выберите новое направление или загрузите свой файл:",
                     reply_markup=markup)

    user_states[message.from_user.id]['action'] = 'change_group_direction'
    bot.register_next_step_handler(message, process_change_group_direction)


def process_change_group_direction(message):
    direction = message.text.strip()
    user_data = user_states.get(message.from_user.id, {})

    if direction == "📁 Загрузить свой файл":
        bot.send_message(message.chat.id,
                         "📎 Пожалуйста, загрузите ваш Excel файл с расписанием:",
                         reply_markup=types.ReplyKeyboardRemove())
        user_states[message.from_user.id]['action'] = 'change_group_file_upload'
        bot.register_next_step_handler(message, process_change_group_file_upload)
        return

    if direction not in EXCEL_FILES:
        bot.send_message(message.chat.id,
                         "❌ Пожалуйста, выберите направление из предложенных вариантов:")
        bot.register_next_step_handler(message, process_change_group_direction)
        return

    # Выбор курса
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    if 'Магистратура' in direction:
        courses = ["1 курс", "2 курс"]
    else:
        courses = ["1 курс", "2 курс", "3 курс", "4 курс"]

    for course in courses:
        markup.add(types.KeyboardButton(course))

    bot.send_message(message.chat.id, "Выберите ваш курс:", reply_markup=markup)

    user_states[message.from_user.id]['direction'] = direction
    user_states[message.from_user.id]['action'] = 'change_group_course'
    bot.register_next_step_handler(message, process_change_group_course)


def process_change_group_file_upload(message):
    if not message.document:
        bot.send_message(message.chat.id,
                         "❌ Пожалуйста, загрузите файл в формате Excel (.xlsx):")
        bot.register_next_step_handler(message, process_change_group_file_upload)
        return

    user_data = user_states.get(message.from_user.id, {})

    # Скачиваем файл
    file_info = bot.get_file(message.document.file_id)
    downloaded_file = bot.download_file(file_info.file_path)

    # Сохраняем файл
    file_extension = message.document.file_name.split('.')[-1]
    if file_extension not in ['xlsx', 'xls']:
        bot.send_message(message.chat.id, "❌ Пожалуйста, загрузите файл в формате Excel (.xlsx или .xls)")
        return

    file_path = os.path.join(UPLOAD_FOLDER, f"{user_data['login']}_{message.document.file_name}")
    with open(file_path, 'wb') as new_file:
        new_file.write(downloaded_file)

    # Выбор курса для загруженного файла
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    courses = ["1 курс", "2 курс", "3 курс", "4 курс"]
    for course in courses:
        markup.add(types.KeyboardButton(course))

    bot.send_message(message.chat.id,
                     f"✅ Файл успешно загружен!\nТеперь выберите курс:",
                     reply_markup=markup)

    user_states[message.from_user.id]['custom_file'] = file_path
    user_states[message.from_user.id]['action'] = 'change_group_course_custom'
    bot.register_next_step_handler(message, process_change_group_course_custom)


def process_change_group_course_custom(message):
    course = message.text.strip()
    valid_courses = ["1 курс", "2 курс", "3 курс", "4 курс"]

    if course not in valid_courses:
        bot.send_message(message.chat.id,
                         "❌ Пожалуйста, выберите курс из предложенных вариантов:")
        bot.register_next_step_handler(message, process_change_group_course_custom)
        return

    # Обновляем данные пользователя с кастомным файлом
    user_data = user_states.get(message.from_user.id, {})
    user_id = str(message.from_user.id)

    users = load_users()

    users[user_id] = {
        'login': user_data['login'],
        'password': user_data['password'],
        'direction': 'custom',
        'course': course,
        'custom_file': user_data.get('custom_file'),
        'registered_at': users[user_id].get('registered_at', datetime.now().isoformat()),
        'last_login': datetime.now().isoformat(),
        'logged_in': True
    }
    save_users(users)

    # Очищаем состояние
    if message.from_user.id in user_states:
        del user_states[message.from_user.id]

    bot.send_message(message.chat.id,
                     f"✅ Данные успешно обновлены!\n"
                     f"🆔 Логин: {user_data['login']}\n"
                     f"🎓 Направление: Загруженный файл\n"
                     f"📚 Курс: {course}\n\n"
                     f"🔓 Ваши данные были изменены!",
                     reply_markup=types.ReplyKeyboardRemove())

    show_main_menu(message)


def process_change_group_course(message):
    course = message.text.strip()
    valid_courses = ["1 курс", "2 курс", "3 курс", "4 курс"]

    user_data = user_states.get(message.from_user.id, {})
    direction = user_data.get('direction')

    if 'Магистратура' in direction:
        valid_courses = ["1 курс", "2 курс"]

    if course not in valid_courses:
        bot.send_message(message.chat.id,
                         "❌ Пожалуйста, выберите курс из предложенных вариантов:")
        bot.register_next_step_handler(message, process_change_group_course)
        return

    # Обновляем данные пользователя
    user_id = str(message.from_user.id)
    users = load_users()

    users[user_id] = {
        'login': user_data['login'],
        'password': user_data['password'],
        'direction': direction,
        'course': course,
        'registered_at': users[user_id].get('registered_at', datetime.now().isoformat()),
        'last_login': datetime.now().isoformat(),
        'logged_in': True
    }
    save_users(users)

    # Очищаем состояние
    if message.from_user.id in user_states:
        del user_states[message.from_user.id]

    bot.send_message(message.chat.id,
                     f"✅ Данные успешно обновлены!\n"
                     f"🆔 Логин: {user_data['login']}\n"
                     f"🎓 Направление: {direction}\n"
                     f"📚 Курс: {course}\n\n"
                     f"🔓 Ваши данные были изменены!",
                     reply_markup=types.ReplyKeyboardRemove())

    show_main_menu(message)


# Функции для работы с Excel
def parse_excel_file(file_path, course_name):
    """Парсит Excel файл и возвращает структурированные данные"""
    try:
        # Определяем лист по курсу
        sheet_name = f"{course_name.split()[0]} курс"

        # Читаем Excel файл
        excel_data_df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)

        # Конвертируем в JSON для дальнейшей обработки
        json_data = excel_data_df.to_json(orient='values')
        data_list = json.loads(json_data)

        return process_excel_data(data_list, course_name)

    except Exception as e:
        print(f"Ошибка парсинга файла {file_path}: {e}")
        return {}


def process_excel_data(data_list, course_name):
    """Обрабатывает данные из Excel и структурирует расписание"""
    schedule = {}
    current_day = None

    for row in data_list:
        # Пропускаем пустые строки
        if not any(cell for cell in row if pd.notna(cell)):
            continue

        # Ищем день недели (первая колонка)
        first_cell = str(row[0]) if len(row) > 0 and pd.notna(row[0]) else ""

        # Проверяем день недели
        if first_cell.strip() in ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']:
            current_day = first_cell.strip()
            schedule[current_day] = []
            continue

        # Если есть текущий день и номер пары
        if current_day and len(row) > 1 and pd.notna(row[1]):
            pair_num = str(row[1]).strip()

            # Проверяем, что это номер пары
            if pair_num.isdigit():
                lesson_data = {
                    'pair': int(pair_num),
                    'subject': '',
                    'teacher': '',
                    'room': '',
                    'type': '',
                    'groups': []
                }

                # Обрабатываем дисциплину (колонка C)
                if len(row) > 2 and pd.notna(row[2]):
                    subject_info = str(row[2])
                    lesson_data.update(extract_subject_info(subject_info))

                # Обрабатываем преподавателя (последняя колонка)
                if len(row) > 6 and pd.notna(row[6]):
                    teacher_info = str(row[6])
                    lesson_data['teacher'] = clean_teacher_name(teacher_info)

                # Добавляем в расписание, если есть предмет
                if lesson_data['subject']:
                    schedule[current_day].append(lesson_data)

    # Сортируем пары по номеру
    for day in schedule:
        schedule[day].sort(key=lambda x: x['pair'])

    return schedule


def extract_subject_info(subject_text):
    """Извлекает информацию о предмете из текста"""
    result = {
        'subject': '',
        'room': '',
        'type': '',
        'groups': []
    }

    if pd.isna(subject_text) or subject_text == 'nan':
        return result

    # Извлекаем тип занятия
    type_match = re.search(r'\((лек|пр|лаб|сем)\)', subject_text, re.IGNORECASE)
    if type_match:
        result['type'] = type_match.group(1).lower()
        subject_text = re.sub(r'\(лек\)|\(пр\)|\(лаб\)|\(сем\)', '', subject_text, flags=re.IGNORECASE)

    # Извлекаем аудиторию
    room_match = re.search(r'[А-Я]\d+', subject_text)
    if room_match:
        result['room'] = room_match.group()
        subject_text = re.sub(r'[А-Я]\d+', '', subject_text)

    # Извлекаем информацию о группах
    if 'п/г' in subject_text:
        group_match = re.search(r'п/г\s*(\d+)', subject_text)
        if group_match:
            result['groups'] = [f"п/г {group_match.group(1)}"]
        subject_text = re.sub(r'п/г\s*\d+', '', subject_text)

    # Очищаем название предмета
    subject_text = re.sub(r'//.*', '', subject_text)
    subject_text = re.sub(r'\s+', ' ', subject_text)
    result['subject'] = subject_text.strip()

    return result


def clean_teacher_name(teacher_text):
    """Очищает имя преподавателя"""
    if pd.isna(teacher_text) or teacher_text == 'nan':
        return ""

    teacher_text = re.sub(r'//.*', '', teacher_text)
    teacher_text = re.sub(r'\s+', ' ', teacher_text)
    return teacher_text.strip()


def get_full_day_name(short_name):
    """Возвращает полное название дня недели"""
    days = {
        'ПН': 'Понедельник',
        'ВТ': 'Вторник',
        'СР': 'Среда',
        'ЧТ': 'Четверг',
        'ПТ': 'Пятница',
        'СБ': 'Суббота'
    }
    return days.get(short_name, short_name)


def format_schedule_for_day(schedule, day_name):
    """Форматирует расписание на день"""
    if day_name not in schedule or not schedule[day_name]:
        return f"📅 {get_full_day_name(day_name)}\n\n🆓 Занятий нет"

    day_schedule = schedule[day_name]
    result = f"📅 {get_full_day_name(day_name)}\n\n"

    for lesson in day_schedule:
        result += f"🕒 Пара {lesson['pair']}:\n"
        result += f"📚 {lesson['subject']}\n"

        if lesson['type']:
            type_emoji = {'лек': '🎤', 'пр': '✏️', 'лаб': '🔬', 'сем': '💬'}
            emoji = type_emoji.get(lesson['type'], '📝')
            result += f"{emoji} {lesson['type'].upper()}\n"

        if lesson['room']:
            result += f"🏫 Ауд: {lesson['room']}\n"

        if lesson['teacher']:
            result += f"👨🏫 {lesson['teacher']}\n"

        if lesson['groups']:
            result += f"👥 {', '.join(lesson['groups'])}\n"

        result += "─" * 30 + "\n"

    return result


def create_calendar_markup(year, month):
    """Создает интерактивный календарь"""
    markup = types.InlineKeyboardMarkup()

    # Заголовок с месяцем и годом
    month_names = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ]

    # Кнопки навигации
    prev_month = month - 1 if month > 1 else 12
    prev_year = year if month > 1 else year - 1
    next_month = month + 1 if month < 12 else 1
    next_year = year if month < 12 else year + 1

    header_row = []
    header_row.append(types.InlineKeyboardButton(
        "⬅️", callback_data=f"calendar_{prev_year}_{prev_month}"
    ))
    header_row.append(types.InlineKeyboardButton(
        f"{month_names[month - 1]} {year}", callback_data="ignore"
    ))
    header_row.append(types.InlineKeyboardButton(
        "➡️", callback_data=f"calendar_{next_year}_{next_month}"
    ))
    markup.row(*header_row)

    # Дни недели
    days_row = []
    for day in ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]:
        days_row.append(types.InlineKeyboardButton(day, callback_data="ignore"))
    markup.row(*days_row)

    # Ячейки календаря
    cal = calendar.monthcalendar(year, month)
    for week in cal:
        week_row = []
        for day in week:
            if day == 0:
                week_row.append(types.InlineKeyboardButton(" ", callback_data="ignore"))
            else:
                # Проверяем, есть ли занятия в этот день
                day_schedule = get_schedule_for_date(year, month, day)
                if day_schedule:
                    # Если есть занятия - кнопка с эмодзи
                    week_row.append(types.InlineKeyboardButton(
                        f"📚{day}", callback_data=f"day_{year}_{month}_{day}"
                    ))
                else:
                    week_row.append(types.InlineKeyboardButton(
                        str(day), callback_data=f"day_{year}_{month}_{day}"
                    ))
        markup.row(*week_row)

    # Кнопка возврата
    markup.row(types.InlineKeyboardButton("🔙 Назад в меню", callback_data="back_to_menu"))

    return markup


def get_schedule_for_date(year, month, day):
    """Получает расписание на конкретную дату"""
    try:
        # Определяем день недели для даты
        date_obj = datetime(year, month, day)
        day_of_week = date_obj.weekday()

        # Соответствие дней недели (0=ПН, 1=ВТ, ... 5=СБ)
        day_map = {0: 'ПН', 1: 'ВТ', 2: 'СР', 3: 'ЧТ', 4: 'ПТ', 5: 'СБ'}

        if day_of_week in day_map:
            day_name = day_map[day_of_week]

            # Загружаем данные пользователя
            schedule_data = load_schedule_data()
            if 'current_schedule' in schedule_data:
                schedule = schedule_data['current_schedule']
                if day_name in schedule and schedule[day_name]:
                    return schedule[day_name]

        return None
    except:
        return None


def format_schedule_for_date(schedule, date_obj):
    """Форматирует расписание на конкретную дату"""
    day_of_week = date_obj.weekday()
    day_map = {0: 'ПН', 1: 'ВТ', 2: 'СР', 3: 'ЧТ', 4: 'ПТ', 5: 'СБ'}

    if day_of_week not in day_map:
        return "❌ В этот день занятий нет"

    day_name = day_map[day_of_week]

    if day_name not in schedule or not schedule[day_name]:
        return f"📅 {date_obj.strftime('%d.%m.%Y')} ({get_full_day_name(day_name)})\n\n🆓 Занятий нет"

    day_schedule = schedule[day_name]
    result = f"📅 {date_obj.strftime('%d.%m.%Y')} ({get_full_day_name(day_name)})\n\n"

    for lesson in day_schedule:
        result += f"🕒 Пара {lesson['pair']}:\n"
        result += f"📚 {lesson['subject']}\n"

        if lesson['type']:
            type_emoji = {'лек': '🎤', 'пр': '✏️', 'лаб': '🔬', 'сем': '💬'}
            emoji = type_emoji.get(lesson['type'], '📝')
            result += f"{emoji} {lesson['type'].upper()}\n"

        if lesson['room']:
            result += f"🏫 Ауд: {lesson['room']}\n"

        if lesson['teacher']:
            result += f"👨🏫 {lesson['teacher']}\n"

        if lesson['groups']:
            result += f"👥 {', '.join(lesson['groups'])}\n"

        result += "─" * 30 + "\n"

    return result


def validate_user_data(user_data):
    """Проверяет и восстанавливает данные пользователя"""
    required_fields = ['login', 'direction', 'course']

    # Проверяем наличие обязательных полей
    for field in required_fields:
        if field not in user_data:
            if field == 'direction':
                user_data[field] = 'Не указано'
            elif field == 'course':
                user_data[field] = '1 курс'
            else:
                user_data[field] = 'Неизвестно'

    return user_data


# Основные функции с защитой авторизацией
@bot.message_handler(func=lambda message: message.text == "📅 Расписание на неделю")
@require_login
def show_weekly_schedule(message):
    users = load_users()
    user_id = str(message.from_user.id)

    user_data = validate_user_data(users[user_id])
    direction = user_data['direction']
    course = user_data['course']

    try:
        if direction == 'custom':
            file_path = user_data.get('custom_file')
            if not file_path or not os.path.exists(file_path):
                bot.send_message(message.chat.id, "Файл расписания не найден. Пожалуйста, загрузите файл заново.")
                return
        else:
            file_path = EXCEL_FILES.get(direction)
            if not file_path or not os.path.exists(file_path):
                bot.send_message(message.chat.id, f"Файл расписания для направления {direction} не найден.")
                return

        schedule = parse_excel_file(file_path, course)

        if not schedule:
            bot.send_message(message.chat.id, "Расписание не найдено или произошла ошибка при парсинге")
            return

        # Сохраняем текущее расписание
        schedule_data = load_schedule_data()
        schedule_data['current_schedule'] = schedule
        save_schedule_data(schedule_data)

        response = f"🎓 Расписание на неделю\n"
        response += f"📚 Направление: {direction}\n"
        response += f"👥 Курс: {course}\n\n"

        days_order = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']

        for day in days_order:
            if day in schedule:
                day_schedule = format_schedule_for_day(schedule, day)
                # Отправляем каждый день отдельным сообщением
                if len(response + day_schedule) > 4000:
                    bot.send_message(message.chat.id, response)
                    response = ""
                response += day_schedule + "\n"

        if response:
            bot.send_message(message.chat.id, response)

    except Exception as e:
        bot.send_message(message.chat.id, f"Ошибка при загрузке расписания: {str(e)}")


@bot.message_handler(func=lambda message: message.text == "📆 Интерактивный календарь")
@require_login
def show_calendar(message):
    users = load_users()
    user_id = str(message.from_user.id)

    # Загружаем и валидируем данные пользователя
    user_data = validate_user_data(users[user_id])
    direction = user_data.get('direction', 'Не указано')
    course = user_data.get('course', '1 курс')

    try:
        if direction == 'custom':
            file_path = user_data.get('custom_file')
            if not file_path or not os.path.exists(file_path):
                bot.send_message(message.chat.id, "Файл расписания не найден. Пожалуйста, загрузите файл заново.")
                return
        else:
            file_path = EXCEL_FILES.get(direction)
            if not file_path or not os.path.exists(file_path):
                bot.send_message(message.chat.id, f"Файл расписания для направления {direction} не найден.")
                return

        schedule = parse_excel_file(file_path, course)

        if not schedule:
            bot.send_message(message.chat.id, "Расписание не найдено или произошла ошибка при парсинге")
            return

        # Сохраняем текущее расписание
        schedule_data = load_schedule_data()
        schedule_data['current_schedule'] = schedule
        schedule_data['current_user'] = user_id
        save_schedule_data(schedule_data)

        # Показываем календарь текущего месяца
        now = datetime.now()
        markup = create_calendar_markup(now.year, now.month)
        bot.send_message(message.chat.id,
                         f"📅 Календарь расписания\n"
                         f"🎓 {direction} - {course}\n"
                         f"📚 Дни с занятиями отмечены значком 📚\n\n"
                         f"Выберите дату:",
                         reply_markup=markup)

    except Exception as e:
        bot.send_message(message.chat.id, f"Ошибка при загрузке календаря: {str(e)}")


@bot.message_handler(func=lambda message: message.text == "📁 Загрузить новый файл")
@require_login
def request_new_file(message):
    bot.send_message(message.chat.id,
                     "📎 Пожалуйста, загрузите новый Excel файл с расписанием:",
                     reply_markup=types.ReplyKeyboardRemove())
    bot.register_next_step_handler(message, process_new_file_upload)


def process_new_file_upload(message):
    if not message.document:
        bot.send_message(message.chat.id,
                         "❌ Пожалуйста, загрузите файл в формате Excel (.xlsx):")
        bot.register_next_step_handler(message, process_new_file_upload)
        return

    users = load_users()
    user_id = str(message.from_user.id)

    if user_id not in users:
        bot.send_message(message.chat.id, "❌ Сначала зарегистрируйтесь с помощью /start")
        return

    # Скачиваем файл
    file_info = bot.get_file(message.document.file_id)
    downloaded_file = bot.download_file(file_info.file_path)

    # Сохраняем файл
    file_extension = message.document.file_name.split('.')[-1]
    if file_extension not in ['xlsx', 'xls']:
        bot.send_message(message.chat.id, "❌ Пожалуйста, загрузите файл в формате Excel (.xlsx или .xls)")
        return

    file_path = os.path.join(UPLOAD_FOLDER, f"{user_id}_{message.document.file_name}")
    with open(file_path, 'wb') as new_file:
        new_file.write(downloaded_file)

    # Обновляем данные пользователя
    users[user_id] = validate_user_data(users[user_id])
    users[user_id]['direction'] = 'custom'
    users[user_id]['custom_file'] = file_path
    save_users(users)

    bot.send_message(message.chat.id,
                     "✅ Файл успешно загружен и обновлен!",
                     reply_markup=types.ReplyKeyboardRemove())
    show_main_menu(message)


# Обработка callback-запросов от календаря
@bot.callback_query_handler(func=lambda call: True)
def handle_callback(call):
    if call.data.startswith('calendar_'):
        # Обработка смены месяца
        _, year, month = call.data.split('_')
        year, month = int(year), int(month)

        markup = create_calendar_markup(year, month)
        bot.edit_message_reply_markup(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            reply_markup=markup
        )

    elif call.data.startswith('day_'):
        # Обработка выбора дня
        _, year, month, day = call.data.split('_')
        year, month, day = int(year), int(month), int(day)

        schedule_data = load_schedule_data()
        if 'current_schedule' in schedule_data:
            schedule = schedule_data['current_schedule']
            date_obj = datetime(year, month, day)
            schedule_text = format_schedule_for_date(schedule, date_obj)

            bot.send_message(call.message.chat.id, schedule_text)
        else:
            bot.send_message(call.message.chat.id, "❌ Расписание не загружено")

    elif call.data == 'back_to_menu':
        bot.delete_message(call.message.chat.id, call.message.message_id)
        show_main_menu(call.message)


# Запуск бота
if __name__ == "__main__":
    print("Бот запущен...")
    bot.infinity_polling()