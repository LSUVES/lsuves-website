from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(view, "owner_field"):
            owner_field = view.owner_field
        else:
            owner_field = "user"
        # TODO: Test if check for user is necessary,
        #       i.e., if request.user == obj.user == null is possible
        return request.user and request.user == getattr(obj, owner_field)
