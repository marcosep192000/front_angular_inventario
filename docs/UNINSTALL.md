# Desinstalacion

Ejecute elevado `uninstall-inventario-pixels.ps1 -RemoveFirewall`. Se eliminan servicio y binarios; PostgreSQL, DB y ProgramData se preservan.

El borrado total exige conjuntamente `-PurgeData -ConfirmDataLoss`. Es irreversible, pero tampoco desinstala PostgreSQL ni elimina su base.
