using System.Collections.Generic;
using UmbNav.Core.Models;

namespace UmbNav.Core.Abstractions;

public interface IUmbNavMenuBuilderService
{
    IEnumerable<UmbNavItem> BuildMenu(IEnumerable<UmbNavItem> items, int level = 0,
        bool removeNoopener = false, bool removeNoreferrer = false);
}
