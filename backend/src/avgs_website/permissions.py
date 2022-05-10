from rest_framework import permissions


class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Only accepts requests from admins or those that are read-only.
    """

    def has_permission(self, request, view):
        return bool(
            request.method in permissions.SAFE_METHODS
            or request.user
            and request.user.is_staff
        )


class IsOwner(permissions.BasePermission):
    """
    Only accepts requests from owners of the object.
    """

    def has_object_permission(self, request, view, obj):
        if hasattr(view, "owner_field"):
            owner_field = view.owner_field
        else:
            owner_field = "user"
        # TODO: Test if check for user is necessary,
        #       i.e., if request.user == obj.user == null is possible
        return bool(request.user and request.user == getattr(obj, owner_field))
