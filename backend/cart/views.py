from dj_rest_auth.views import APIView
from rest_framework.views import Response
from rest_framework.exceptions import PermissionDenied, ValidationError, NotFound
from django.contrib.auth.models import AnonymousUser
from drf_spectacular.utils import extend_schema

from .models import Cart, CartItem
from products.models import Product
from .serializers import CartSerializer

import json
from uuid import UUID
import datetime


@extend_schema(tags=['Carts'], summary="Удаление корзины")
class DeleteCartView(APIView):
    serializer_class = None
    def delete(self, request):
        try:
            cart_uuid = json.loads(request.COOKIES.get('cart'))
            user = self.request.user
            if isinstance(user, AnonymousUser):
                user = None

            if cart_uuid:
                try:
                    UUID(cart_uuid)
                except ValueError:
                    raise ValidationError('Некорректный UUID корзины')

                try:
                    cart = Cart.objects.get(id=cart_uuid)
                except Cart.DoesNotExist:
                    raise NotFound("Корзина не найдена")

                if not (cart.user == user):
                    raise PermissionDenied('У вас нет доступа к этой корзине')

                cart.delete()

            return Response({'message': 'Корзина удалена'}, status=200)

        except PermissionDenied as e:
            return Response({"message": str(e)}, status=403)
        except ValidationError as e:
            return Response({"message": str(e)}, status=400)
        except NotFound as e:
            return Response({"message": str(e)}, status=404)
        except Exception as e:
            return Response({"message": "Ошибка запроса"}, status=400)


@extend_schema(tags=['Carts'], summary="Для получепния информации о колиестве товаров в корзине")
class CartCount(APIView):
    serializer_class = None
    def get(self, request, **kwargs):
        try:
            cart_uuid_cookie = request.COOKIES.get('cart')
            if cart_uuid_cookie is None:
                cart_uuid = None
            else:
                cart_uuid = json.loads(cart_uuid_cookie)
            user = self.request.user
            if isinstance(user, AnonymousUser):
                user = None

            cart = Cart.objects.get(id=cart_uuid, user=user)

            response = Response({'message': 'Количество товара получено', "count": len(cart.cart_items.all())}, status=200)

            return response

        except PermissionDenied as e:
            return Response({"message": str(e)}, status=403)
        except ValidationError as e:
            return Response({"message": str(e)}, status=400)
        except NotFound as e:
            return Response({"message": str(e)}, status=404)
        except Exception as e:
            print(e)
            return Response({"message": "Ошибка запроса"}, status=400)


def get_or_create_cart(cart_uuid=None, user=None):
    """
    Функция для получения корзины или её создания, если она не существует
    """
    try:
        if isinstance(user, AnonymousUser):
            user = None

        if cart_uuid:
            try:
                UUID(cart_uuid)
            except ValueError:
                raise ValidationError('Некорректный UUID корзины')

        try:
            cart = Cart.objects.get(id=cart_uuid)
        except Cart.DoesNotExist:
            if user is None:
                cart = Cart.objects.create()
            else:
                cart, _ = Cart.objects.get_or_create(user=user)
        if not (cart.user == user):
            raise PermissionDenied('У вас нет доступа к этой корзине')

        return cart

    except Exception as error:
        raise error

@extend_schema(tags=['Carts'], summary="Список товаров в корзине")
class CartItemList(APIView):
    serializer_class = None
    def get(self, request):
        try:

            cart_uuid = json.loads(request.COOKIES.get('cart'))
            user = self.request.user

            cart = get_or_create_cart(cart_uuid, user)

            response = Response({'message': 'Корзина получена', **CartSerializer(cart, context={'request': self.request}).data}, status=200)

            week = datetime.datetime.now() + datetime.timedelta(days=7)
            response.set_cookie('cart', json.dumps(str(cart.id)), max_age=week.timestamp(),
                                secure=True, samesite='None')

            return response

        except PermissionDenied as e:
            return Response({"message": str(e)}, status=403)
        except ValidationError as e:
            return Response({"message": str(e)}, status=400)
        except NotFound as e:
            return Response({"message": str(e)}, status=404)
        except Exception as e:
            return Response({"message": "Ошибка запроса"}, status=400)

@extend_schema(tags=['Carts'], summary="Добавление товаров в корзину")
class CartItemAdd(APIView):
    serializer_class = None
    def post(self, request):
        try:

            data = request.data
            pk = data['product']
            cart_uuid_cookie = request.COOKIES.get('cart')
            if cart_uuid_cookie is None:
                cart_uuid = None
            else:
                cart_uuid = json.loads(cart_uuid_cookie)
            user = self.request.user

            cart = get_or_create_cart(cart_uuid, user)

            try:
                product = Product.objects.get(pk=pk)
            except Product.DoesNotExist:
                raise NotFound('Товар не найден')

            cart_item, created = CartItem.objects.get_or_create(
                product=product,
                cart=cart
            )

            if not created:
                cart_item.quantity += 1
                cart_item.save()
                response = Response({'message': 'Товар Обновлён'}, status=204)
            else:
                response = Response({'message': 'Товар добавлен'}, status=200)

            cart.save()
            week = datetime.datetime.now() + datetime.timedelta(days=7)
            response.set_cookie('cart', json.dumps(str(cart.id)), max_age=week.timestamp(),
                                secure=True, samesite='None')

            return response

        except PermissionDenied as e:
            return Response({"message": str(e)}, status=403)
        except ValidationError as e:
            return Response({"message": str(e)}, status=400)
        except NotFound as e:
            return Response({"message": str(e)}, status=404)
        except Exception as e:
            return Response({"message": "Ошибка запроса"}, status=400)


@extend_schema(tags=['Carts'], summary="Обновление информации о товаре в корзине")
class CartItemUpdate(APIView):
    serializer_class = None
    def put(self, request, product_id):
        try:
            data = request.data
            pk = product_id
            quantity = data['quantity']
            cart_uuid_cookie = request.COOKIES.get('cart')
            if cart_uuid_cookie is None:
                return Response({'message': 'Данные о корзине не получены'}, status=400)
            else:
                cart_uuid = json.loads(cart_uuid_cookie)
            user = self.request.user

            cart = get_or_create_cart(cart_uuid, user)

            try:
                product = Product.objects.get(pk=pk)
            except Product.DoesNotExist:
                raise NotFound('Товар не найден')
            try:
                cart_item = CartItem.objects.get(product=product, cart=cart)
            except CartItem.DoesNotExist:
                raise NotFound('Товар не найден в корзине')

            if quantity >= 1:
                cart_item.quantity = quantity
                cart_item.save()
                message = 'Количество товара обновлено'
            else:
                cart_item.delete()
                message = 'Товар удалён из корзины'

            response = Response({'message': message}, status=200)

            cart.save()
            week = datetime.datetime.now() + datetime.timedelta(days=7)
            response.set_cookie('cart', json.dumps(str(cart.id)), max_age=week.timestamp(),
                                secure=True, samesite='None')

            return response

        except PermissionDenied as e:
            return Response({"message": str(e)}, status=403)
        except ValidationError as e:
            return Response({"message": str(e)}, status=400)
        except NotFound as e:
            return Response({"message": str(e)}, status=404)
        except Exception as e:
            return Response({"message": "Ошибка запроса"}, status=400)


@extend_schema(tags=['Carts'], summary="Удаление товара из корзины")
class CartItemDelete(APIView):
    serializer_class = None
    def delete(self, request, product_id):
        try:
            pk = product_id
            cart_uuid_cookie = request.COOKIES.get('cart')
            if cart_uuid_cookie is None:
                return Response({'message': 'Данные о корзине не получены'}, status=400)
            else:
                cart_uuid = json.loads(cart_uuid_cookie)
            user = self.request.user

            cart = get_or_create_cart(cart_uuid, user)

            try:
                product = Product.objects.get(pk=pk)
            except Product.DoesNotExist:
                raise NotFound('Товар не найден')

            try:
                cart_item = CartItem.objects.get(product=product, cart=cart)
                cart_item.delete()
                message = 'Товар удалён из корзины'
            except CartItem.DoesNotExist:
                raise NotFound('Товар не найден в корзине')

            response = Response({'message': message}, status=200)

            cart.save()
            week = datetime.datetime.now() + datetime.timedelta(days=7)
            response.set_cookie('cart', json.dumps(str(cart.id)), max_age=week.timestamp(),
                                secure=True, samesite='None')

            return response

        except PermissionDenied as e:
            return Response({"message": str(e)}, status=403)
        except ValidationError as e:
            return Response({"message": str(e)}, status=400)
        except NotFound as e:
            return Response({"message": str(e)}, status=404)
        except Exception as e:
            return Response({"message": "Ошибка запроса"}, status=400)
