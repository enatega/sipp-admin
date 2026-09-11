'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface SubModule {
  id: string;
  name: string;
  permissions: Permission[];
}

interface Module {
  id: string;
  name: string;
  subModules: SubModule[];
}

interface PermissionCardProps {
  module: Module;
  selectedPermissions: string[];
  onPermissionChange: (permissionId: string, checked: boolean) => void;
  onBulkPermissionChange?: (permissionIds: string[], checked: boolean) => void;
}

export default function PermissionCard({
  module,
  selectedPermissions = [],
  onPermissionChange,
  onBulkPermissionChange,
}: PermissionCardProps) {
  const [expandedModule, setExpandedModule] = useState(true);
  const [expandedSubModules, setExpandedSubModules] = useState<string[]>([]);

  // Ensure selectedPermissions is always an array
  const safeSelectedPermissions = Array.isArray(selectedPermissions)
    ? selectedPermissions
    : [];

  const toggleSubModule = (subModuleId: string) => {
    setExpandedSubModules((prev) =>
      prev.includes(subModuleId)
        ? prev.filter((id) => id !== subModuleId)
        : [...prev, subModuleId],
    );
  };

  const isSubModuleExpanded = (subModuleId: string) =>
    expandedSubModules.includes(subModuleId);

  // Check if all permissions in a submodule are selected
  const isAllSubModulePermissionsSelected = (subModule: SubModule) => {
    return subModule.permissions.every((permission) =>
      safeSelectedPermissions.includes(permission.id),
    );
  };

  // Check if some permissions in a submodule are selected
  const isSomeSubModulePermissionsSelected = (subModule: SubModule) => {
    const selectedCount = subModule.permissions.filter((permission) =>
      safeSelectedPermissions.includes(permission.id),
    ).length;
    return selectedCount > 0 && selectedCount < subModule.permissions.length;
  };

  // Handle select/deselect all permissions in a submodule
  const handleSubModuleCheckboxChange = (subModule: SubModule) => {
    const allSelected = isAllSubModulePermissionsSelected(subModule);

    // If all are selected, deselect all
    // If some or none are selected, select all
    const shouldSelect = !allSelected;

    // Use bulk update if available, otherwise individual updates
    if (onBulkPermissionChange) {
      const permissionIds = subModule.permissions.map((p) => p.id);
      onBulkPermissionChange(permissionIds, shouldSelect);
    } else {
      subModule.permissions.forEach((permission) => {
        onPermissionChange(permission.id, shouldSelect);
      });
    }
  };

  return (
    <div className="border shadow-xs rounded-lg overflow-hidden bg-background">
      {/* Module Header */}
      <div
        className="flex items-center justify-between p-4 bg-accent/50 cursor-pointer hover:bg-accent/70 transition-colors"
        onClick={() => setExpandedModule(!expandedModule)}
      >
        <h3 className="font-semibold text-base">{module.name}</h3>
        {expandedModule ? (
          <ChevronUp className="size-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-5 text-muted-foreground" />
        )}
      </div>

      {/* Module Content */}
      {expandedModule && (
        <div className="p-4 space-y-4">
          {module.subModules.map((subModule) => (
            <div
              key={subModule.id}
              className="border shadow-xs rounded-lg space-y-3"
            >
              {/* SubModule Header */}
              <div
                className="flex items-center justify-between p-3 bg-accent/40 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => toggleSubModule(subModule.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`submodule-${subModule.id}`}
                    checked={isAllSubModulePermissionsSelected(subModule)}
                    indeterminate={isSomeSubModulePermissionsSelected(
                      subModule,
                    )}
                    onCheckedChange={() => {
                      handleSubModuleCheckboxChange(subModule);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Label
                    htmlFor={`submodule-${subModule.id}`}
                    className="font-medium text-sm cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {subModule.name}
                  </Label>
                </div>
                {isSubModuleExpanded(subModule.id) ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </div>

              {/* Permissions Grid */}
              {isSubModuleExpanded(subModule.id) && (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-8 mb-3">
                  {subModule.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start gap-2 p-3 border rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <Checkbox
                        id={permission.id}
                        checked={safeSelectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) =>
                          onPermissionChange(permission.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={permission.id}
                          className="text-sm font-normal cursor-pointer leading-tight"
                        >
                          {permission.name}
                        </Label>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
