import csv
import json

from django.core.files import File
from django.db import transaction
from pytils.translit import slugify

from products.models import Brand, Category, Product


def setup_django():
    import os
    import django
    from django.conf import settings

    if not settings.configured:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')
        django.setup()

setup_django()


def import_products_from_files():

    upload_dir = 'files_for_uploads'
    images_dir = f'{upload_dir}/images'

    total_processed = 0
    total_created = 0
    total_skipped = 0

    if not upload_dir.exists():
        print(f"Папка {upload_dir} не существует!")
        return

    if not images_dir.exists():
        print(f"Папка {images_dir} не существует!")
        return

    files = list(upload_dir.glob('*'))
    if not files:
        print("Нет файлов для обработки")
        return

    print(f"Найдено {len(files)} файлов для обработки")

    for file_path in files:
        if file_path.is_dir():
            continue

        file_ext = file_path.suffix.lower()

        if file_ext not in ['.csv', '.json']:
            try:
                file_path.unlink()
                print(f"Удален файл неподдерживаемого формата: {file_path.name}")
                total_skipped += 1
            except Exception as e:
                print(f"Ошибка при удалении файла {file_path.name}: {str(e)}")
            continue

        try:
            with transaction.atomic():
                if file_ext == '.csv':
                    products_data = process_csv_file(file_path)
                else:
                    products_data = process_json_file(file_path)

                created = create_products_with_images(products_data, images_dir)
                total_created += created
                total_processed += len(products_data)

                file_path.unlink()
                print(f"Успешно обработан и удален файл: {file_path.name}")

        except Exception as e:
            print(f"Ошибка при обработке файла {file_path.name}: {str(e)}")
            continue

    print("\nИтоги импорта:")
    print(f"Обработано файлов: {len(files) - total_skipped}")
    print(f"Добавлено товаров: {total_created}")
    print(f"Всего обработано записей: {total_processed}")
    print(f"Пропущено файлов: {total_skipped}")


def process_csv_file(file_path):
    products = []

    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row in reader:
            product_data = {
                'name': row.get('name', '').strip(),
                'price_standart': int(row.get('price', 0)),
                'discount': int(row.get('discount', 0)),
                'height': int(row.get('height', 0)) if row.get('height') else None,
                'width': int(row.get('width', 0)) if row.get('width') else None,
                'depth': int(row.get('depth', 0)) if row.get('depth') else None,
                'image_path': row.get('image', '').strip(),
            }

            # Обработка бренда
            if row.get('brand'):
                brand, _ = Brand.objects.get_or_create(name=row['brand'].strip())
                product_data['brand'] = brand

            # Обработка категорий
            if row.get('categories'):
                categories = []
                for cat_name in row['categories'].split(','):
                    cat_name = cat_name.strip()
                    if cat_name:
                        category, _ = Category.objects.get_or_create(
                            name=cat_name,
                            name_latinica=slugify(cat_name)
                        )
                        categories.append(category)
                product_data['categories'] = categories

            products.append(product_data)

    return products


def process_json_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    products = []

    for item in data:
        product_data = {
            'name': item.get('name', '').strip(),
            'price_standart': int(item.get('price', 0)),
            'discount': int(item.get('discount', 0)),
            'height': int(item.get('height', 0)) if item.get('height') else None,
            'width': int(item.get('width', 0)) if item.get('width') else None,
            'depth': int(item.get('depth', 0)) if item.get('depth') else None,
            'image_path': item.get('image', '').strip(),
        }

        if item.get('brand'):
            brand, _ = Brand.objects.get_or_create(name=item['brand'].strip())
            product_data['brand'] = brand

        if item.get('categories'):
            categories = []
            for cat_name in item['categories']:
                cat_name = cat_name.strip()
                if cat_name:
                    category, _ = Category.objects.get_or_create(
                        name=cat_name,
                        name_latinica=slugify(cat_name))
                    categories.append(category)
                    product_data['categories'] = categories

                    products.append(product_data)

    return products


def create_products_with_images(products_data, images_dir):
    created_count = 0

    for product_data in products_data:
        image_path = product_data.pop('image_path', '')
        categories = product_data.pop('categories', [])
        brand = product_data.pop('brand', None)

        product, created = Product.objects.update_or_create(
            name=product_data['name'],
            defaults=product_data
        )

        if brand:
            product.brand = brand

        if categories:
            product.category.set(categories)

        if image_path:
            image_full_path = images_dir / image_path
            if image_full_path.exists():
                with open(image_full_path, 'rb') as img_file:
                    product.image.save(
                        image_path,
                        File(img_file),
                        save=True
                    )
            else:
                print(f"Изображение не найдено: {image_path} для товара {product.name}")

        if created:
            created_count += 1

    return created_count